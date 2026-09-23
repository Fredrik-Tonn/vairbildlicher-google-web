import { type VAIRResponse } from '$lib';

interface SharedState {
	uploadedFilesDB: Record<string, { mimeType: string; filePath: string }>;
}

export const sharedState: SharedState = {
	uploadedFilesDB: {},
}

export const vairResponses: Array<VAIRResponse> = [
	{
		result: {
			completion: 'Das ist eine __abgeschlossene__ Antwort.\n\nOhne weitere Erläuterungen.',
			completion_items: [
				'Das ist eine __abgeschlossene__ Antwort.',
				'Ohne weitere Erläuterungen.'
			],
			questions: ['Was ist dein Name?', 'Wie spät ist es?', 'Was ist dein Lieblingsessen?']
		},
		meta: {
			chatid: '20250214110000'
		}
	},
	{
		result: {
			completion: 'Vielen Dank für *Ihre* Anfrage.',
			completion_items: [
				'Vielen Dank für *Ihre* Anfrage.'
			],
			questions: [
				'Wie funktioniert das System?',
				'Welche Möglichkeiten gibt es?',
				'Gibt es Einschränkungen?'
			]
		},
		meta: {
			chatid: '20250214110000'
		}
	},
	{
		result: {
			completion: 'Hier ist die **gewünschte** "Information".',
			questions: [
				'Wo finde ich die Datei?',
				'Welche Version soll ich verwenden?',
				'Gibt es eine Installationsanleitung?'
			]
		},
		meta: {
			chatid: '20250214110000'
		}
	},
	{
		result: {
			completion: '**Entschuldigen Sie**, ich habe diese "Information" nicht.\n\nVersuche was anderes.',
			questions: [
				'Kann das aktualisiert werden?',
				'Wann ist die nächste Besprechung?',
				'Wer ist zuständig?'
			]
		},
		meta: {
			chatid: '20250214110000'
		}
	},
	{
		result: {
			completion: 'Das "System" arbeitet wie erwartet.\nWas wollen __Sie__ mehr?',
			questions: [
				'Warum ist die Antwort so?',
				'Wie kann ich das ändern?',
				'Was sind die nächsten Schritte?'
			]
		},
		meta: {
			chatid: '20250214110000'
		}
	}
];
