<script lang="ts">
	let { label, onclick, addClass, inputDisabled }:
			{ label: string, onclick?: () => void, addClass?: string, inputDisabled: boolean } = $props()
</script>

<button type="button" {onclick}
				disabled={inputDisabled}
				class="fixed right-4 top-4 z-50 rounded-full bg-white px-3 py-1.5 opacity-85 text-sm font-semibold text-gray-900 ring-1 shadow-md ring-gray-300 ring-inset hover:bg-gray-50 {addClass}">
	{label}
</button>