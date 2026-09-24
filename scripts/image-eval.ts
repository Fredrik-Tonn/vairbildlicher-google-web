/**
 * Compares image inputs for the "one image per sentence" pipeline.
 *
 *   node scripts/image-eval.ts                     all files in local-files/eval-texts
 *   node scripts/image-eval.ts --only maerchen     only files whose name contains "maerchen"
 *   node scripts/image-eval.ts --variants context  only some variants (sentence,context,original)
 *
 * Input: .txt (the text as it would be read from the photo), or .jpg/.png/.pdf.
 * Output: local-files/eval-output/<timestamp>/index.html with all images, briefs and timings.
 *
 * Variants:
 *   sentence  – V1: image model gets the simplified sentence only
 *   context   – V2: sentence + brief + shared context from the summary call (what the app does)
 *   original  – V3: sentence + the full original text (only for .txt inputs)
 */
import { GoogleGenAI } from '@google/genai'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'
import { parseArgs } from 'node:util'
import { buildImagePrompt, parseSummaryJson } from '../src/lib/server/services/image-plan.ts'

const MODEL_TEXT = 'gemini-3.8-flash'
const MODEL_IMAGE = 'gemini-3.1-flash-image'
const PROMPTS_DIR = 'local-files/system-prompts'
const INPUT_DIR = 'local-files/eval-texts'
const ALL_VARIANTS = ['sentence', 'context', 'original'] as const
type Variant = (typeof ALL_VARIANTS)[number]

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.pdf': 'application/pdf'
}

const { values: args } = parseArgs({
	options: {
		only: { type: 'string' },
		variants: { type: 'string', default: ALL_VARIANTS.join(',') }
	}
})
const variants = args.variants!.split(',').filter((v): v is Variant => (ALL_VARIANTS as readonly string[]).includes(v))

try {
	process.loadEnvFile('.env')
} catch {
	// GEMINI_API_KEY may also come from the shell
}
if (!process.env.GEMINI_API_KEY) {
	console.error('GEMINI_API_KEY fehlt (.env oder Umgebung).')
	process.exit(1)
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const summaryPrompt = await readFile(join(PROMPTS_DIR, 'SummarySystemPrompt_v3.txt'), 'utf-8')
const imageRules = await readFile(join(PROMPTS_DIR, 'ImageSystemPrompt.txt'), 'utf-8')

const summarize = async (file: string) => {
	const ext = extname(file).toLowerCase()
	const path = join(INPUT_DIR, file)
	const originalText = ext === '.txt' ? await readFile(path, 'utf-8') : undefined
	const input = originalText
		? [{ type: 'text', text: `Fasse diesen Text exakt nach den Regeln für Leichte Sprache zusammen:\n\n${originalText}` }]
		: [
				{
					type: MIME_TYPES[ext] === 'application/pdf' ? 'document' : 'image',
					data: (await readFile(path)).toString('base64'),
					mime_type: MIME_TYPES[ext]
				},
				{ type: 'text', text: 'Lies den Text auf diesen Bildern oder Dokumenten und fasse ihn exakt nach den Regeln für Leichte Sprache zusammen.' }
			]

	const startedAt = Date.now()
	const interaction = await ai.interactions.create({
		model: MODEL_TEXT,
		system_instruction: summaryPrompt,
		input: input as any,
		response_format: { type: 'json_object' } as any
	})
	const raw = (interaction.output_text || '').trim()
	return { raw, parsed: parseSummaryJson(raw), ms: Date.now() - startedAt, originalText }
}

const generateImage = async (prompt: string) => {
	const startedAt = Date.now()
	try {
		const interaction = await ai.interactions.create({
			model: MODEL_IMAGE,
			response_modalities: ['image'],
			input: prompt
		})
		for (const step of interaction.steps || []) {
			if (step.type !== 'model_output') continue
			for (const item of (step as any).content || []) {
				if (item.type === 'image' && item.data) {
					return { data: item.data as string, mime: (item.mime_type as string) || 'image/png', ms: Date.now() - startedAt }
				}
			}
		}
		return { error: 'kein Bild in der Antwort', ms: Date.now() - startedAt }
	} catch (e) {
		return { error: (e as Error).message, ms: Date.now() - startedAt }
	}
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const outDir = join('local-files/eval-output', new Date().toISOString().replace(/[:.]/g, '-'))
await mkdir(outDir, { recursive: true })

const files = (await readdir(INPUT_DIR))
	.filter((f) => ext(f) === '.txt' || ext(f) in MIME_TYPES)
	.filter((f) => !args.only || f.includes(args.only))
	.sort()
function ext(f: string) {
	return extname(f).toLowerCase()
}

const report: unknown[] = []
let html = ''

for (const file of files) {
	const name = basename(file, extname(file))
	console.log(`\n== ${file}`)
	const summary = await summarize(file)
	if (!summary.parsed) {
		console.log(`   JSON nicht lesbar (${summary.ms} ms):\n${summary.raw}`)
		html += `<section><h2>${escapeHtml(file)}</h2><p class="err">JSON nicht lesbar</p><pre>${escapeHtml(summary.raw)}</pre></section>`
		continue
	}
	const { sentences, plan } = summary.parsed
	console.log(`   Text ${summary.ms} ms, genre: ${plan.genre}`)

	const rows: string[] = []
	const entry = { file, genre: plan.genre, textMs: summary.ms, context: plan.context, sentences: [] as unknown[] }

	for (const variant of variants) {
		if (variant === 'original' && !summary.originalText) continue
		const startedAt = Date.now()
		// Sentences in parallel, like the app
		const images = await Promise.all(
			sentences.map((sentence, i) => {
				let prompt = buildImagePrompt({
					rules: imageRules,
					sentence,
					variant: variant === 'context' ? 'context' : 'sentence',
					genre: variant === 'sentence' ? undefined : plan.genre,
					brief: plan.briefs[i],
					context: plan.context
				})
				if (variant === 'original') prompt += `\n\nORIGINAL TEXT (for background only)\n${summary.originalText}`
				return generateImage(prompt)
			})
		)
		console.log(`   ${variant}: ${Date.now() - startedAt} ms für ${images.length} Bilder`)

		const cells = await Promise.all(
			images.map(async (img, i) => {
				if (!('data' in img) || !img.data) return `<td class="err">${escapeHtml(img.error ?? '')}<br>${img.ms} ms</td>`
				const imgFile = `${name}_${variant}_${i + 1}.${img.mime.split('/')[1]}`
				await writeFile(join(outDir, imgFile), Buffer.from(img.data, 'base64'))
				return `<td><img src="${imgFile}" alt=""><br>${img.ms} ms</td>`
			})
		)
		rows.push(`<tr><th>${variant}</th>${cells.join('')}</tr>`)
		entry.sentences.push({ variant, ms: images.map((i) => i.ms) })
	}

	report.push(entry)
	const characters = plan.context.characters.map((c) => `${c.id}: ${c.look}`).join('<br>')
	html += `<section>
<h2>${escapeHtml(file)} <small>${plan.genre} · Text ${summary.ms} ms</small></h2>
<p><b>Setting:</b> ${escapeHtml(plan.context.setting)}<br><b>Figuren:</b> ${characters || '–'}</p>
<table><tr><th></th>${sentences.map((s, i) => `<th>${escapeHtml(s)}<br><small>${escapeHtml(plan.briefs[i])}</small></th>`).join('')}</tr>
${rows.join('\n')}</table></section>`
}

await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
await writeFile(
	join(outDir, 'index.html'),
	`<!doctype html><html lang="de"><meta charset="utf-8"><title>Bild-Vergleich</title>
<style>body{font:14px system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;vertical-align:top;max-width:320px}
img{width:300px}th small{font-weight:normal;color:#555}.err{color:#b00}</style>
<h1>Bild-Vergleich ${new Date().toLocaleString('de-DE')}</h1>
<p>sentence = nur Satz · context = Satz + Kontext aus dem Original (wie in der App) · original = Satz + ganzer Originaltext</p>
${html}</html>`
)
console.log(`\nFertig: ${join(outDir, 'index.html')}`)
