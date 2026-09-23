// Browser-only helpers for preparing photos before upload

const MAX_IMAGE_SIDE = 2048
const JPEG_QUALITY = 0.85

/**
 * Scales a photo (data URL) down to at most MAX_IMAGE_SIDE px on its longest side
 * and re-encodes it as JPEG. Phone photos shrink from several MB to a few hundred kB,
 * which shortens the upload and the Gemini response time.
 * Returns the original data URL if it is not an image or cannot be decoded.
 */
export const downscaleImage = async (dataURL: string): Promise<string> => {
	if (!dataURL.startsWith('data:image/')) return dataURL

	try {
		const img = new Image()
		img.src = dataURL
		await img.decode()

		const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
		const canvas = document.createElement('canvas')
		canvas.width = Math.round(img.naturalWidth * scale)
		canvas.height = Math.round(img.naturalHeight * scale)

		const ctx = canvas.getContext('2d')
		if (!ctx) return dataURL
		// White background, so transparent PNGs don't turn black as JPEG
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

		const result = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
		return result.length < dataURL.length ? result : dataURL
	} catch (e) {
		console.warn('Bild konnte nicht verkleinert werden, sende Original:', e)
		return dataURL
	}
}
