// Client-safe constants that can be used in browser
export const chatbotName = 'Verainfacher'
export const waitToSendMessage = 1000
export const maxUploadFileCount = 5
// Per file. Gemini itself accepted 100 MB PDFs in tests (23.09.2026); 20 MB keeps mobile uploads fast
export const maxUploadFileSizeMB = 20
// File types the upload accepts (photos are downscaled before sending, PDFs are sent as they are)
export const acceptedUploadTypes = 'image/png, image/jpeg, image/gif, image/webp, application/pdf'
export const fetchTimeout = 3 * 60 * 1000
