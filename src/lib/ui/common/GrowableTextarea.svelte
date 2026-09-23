<script lang="ts">
	import { onMount } from 'svelte'

	let { name, id, placeholder, value = $bindable(), inputDisabled, onShortcut }:
			{ name: string, id: string, placeholder: string, value: string, inputDisabled: boolean,
				onShortcut: (event: KeyboardEvent) => void } = $props()

	let textarea: HTMLTextAreaElement | undefined = $state()
	let div: HTMLDivElement

	onMount(() => {
		textarea?.focus()
	})

	// Reset function to clear the replicated value
	export const reset = () => {
		if (div) {
			div.dataset.replicatedValue = ''
		}
	}

	const oninput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement
		div.dataset.replicatedValue = target.value
	}
	
	// Handle keydown to prevent default Enter behavior when not using Shift
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
		}
	}
</script>

<div class="grow-wrap" bind:this={div}>
	<textarea 
		rows="1" 
		{name} 
		{id} 
		{placeholder}
		bind:this={textarea}
		onkeyup={onShortcut}
		onkeydown={onKeyDown}
		disabled={inputDisabled}
		{oninput} 
		bind:value 
		class="w-full bg-transparent border-0 px-3 py-2 text-gray-800 placeholder:text-gray-500 focus:outline-none disabled:text-gray-500"
		aria-label="Nachrichtenfeld"
		autocomplete="off"
		autocapitalize="sentences"
		spellcheck="true"
		style="font-size: 16px; -webkit-text-size-adjust: 100%;"
	></textarea>
</div>

<style>
    .grow-wrap {
        /* easy way to plop the elements on top of each other and have them both sized based on the tallest one's height */
        display: grid;
        max-height: 150px;
        overflow-y: auto;

        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;

        /* Adds a hyphen where the word breaks, if supported (No Blink) */
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    }
    .grow-wrap::after {
        /* Note the weird space! Needed to preventy jumpy behavior */
        content: attr(data-replicated-value) " ";

        /* This is how textarea text behaves */
        white-space: pre-wrap;

        /* Hidden from view, clicks, and screen readers */
        visibility: hidden;
    }
    .grow-wrap > textarea {
        /* You could leave this, but after a user resizes, then it ruins the auto sizing */
        resize: none;

        /* Firefox shows scrollbar on growth, you can hide like this. */
        overflow: hidden;
    }
    .grow-wrap::after,
    .grow-wrap > textarea {
        /* Identical styling required!! */
        padding: 0.5rem 0.75rem;
        font: inherit;
        line-height: 1.5;
        
        /* Place on top of each other */
        grid-area: 1 / 1 / 2 / 2;
    }
</style>
