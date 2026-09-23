import type { Challenge } from './domain/verainfacher.model'

/**
 * Mock challenge data for development
 * This simulates what the backend would send
 */
export const createMockChallenge = (): Challenge => {
	const challenges: Challenge[] = [
		{
			type: 'multiplechoice',
			questions: [
				{
					question: 'Warum sucht die Gemeinde Rellingen neue Wohnungen?',
					answers: [
						{ text: 'Weil der Bürgermeister eine neue Wohnung für seine Katze sucht.', correct: false },
						{ text: 'Weil es viele Geflüchtete gibt, die eine Unterkunft brauchen.', correct: true },
						{ text: 'Weil die Gemeinde ein geheimes Hotel eröffnen will.', correct: false }
					]
				},
				{
					question: 'Welche Art von Wohnungen nimmt die Gemeinde auch?',
					answers: [
						{ text: 'Nur nagelneue Luxusvillen mit Pool und Personal.', correct: false },
						{ text: 'Auch alte und nicht renovierte Wohnungen.', correct: true },
						{ text: 'Nur Wohnungen auf dem Mond.', correct: false }
					]
				},
				{
					question: 'Wer kann sich melden, wenn er Wohnraum anbieten möchte?',
					answers: [
						{ text: 'Nur Superhelden mit eigenem Schloss.', correct: false },
						{ text: 'Alle, die Wohnungen oder Räume in Rellingen haben.', correct: true },
						{ text: 'Nur Leute mit mindestens drei Papageien.', correct: false }
					]
				}
			]
		},
		{
			type: 'multiplechoice',
			questions: [
				{
					question: 'Was sind Steuern?',
					answers: [
						{ text: 'Geld, das man dem Staat gibt für öffentliche Aufgaben.', correct: true },
						{ text: 'Geschenke, die man zu Weihnachten bekommt.', correct: false },
						{ text: 'Süßigkeiten, die nur Erwachsene essen dürfen.', correct: false }
					]
				},
				{
					question: 'Wofür werden Steuern verwendet?',
					answers: [
						{ text: 'Für Schulen, Straßen und Krankenhäuser.', correct: true },
						{ text: 'Für private Partys von Politikern.', correct: false },
						{ text: 'Um Drachen zu füttern.', correct: false }
					]
				}
			]
		},
		{
			type: 'multiplechoice',
			questions: [
				{
					question: 'Was ist ein Vertrag?',
					answers: [
						{ text: 'Ein Papier mit magischen Kräften.', correct: false },
						{ text: 'Eine Vereinbarung zwischen zwei oder mehr Personen.', correct: true },
						{ text: 'Ein Rezept für leckeren Kuchen.', correct: false }
					]
				},
				{
					question: 'Was passiert, wenn man einen Vertrag unterschreibt?',
					answers: [
						{ text: 'Man muss sich an die Vereinbarung halten.', correct: true },
						{ text: 'Man wird automatisch reich und berühmt.', correct: false },
						{ text: 'Man kann fliegen wie ein Vogel.', correct: false }
					]
				},
				{
					question: 'Kann man einen Vertrag wieder rückgängig machen?',
					answers: [
						{ text: 'Ja, aber nur bei Vollmond.', correct: false },
						{ text: 'Manchmal, wenn beide Seiten einverstanden sind.', correct: true },
						{ text: 'Nein, niemals, auch nicht mit Zauberei.', correct: false }
					]
				}
			]
		}
	]

	// Return a random challenge
	return challenges[Math.floor(Math.random() * challenges.length)]
}

/**
 * Shuffle array elements randomly
 */
export const shuffleArray = <T>(array: T[]): T[] => {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}
