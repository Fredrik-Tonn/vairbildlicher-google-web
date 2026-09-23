<script lang="ts">
	import type { SVGProps } from '$lib'
	let { ...props }: SVGProps = $props()
	let className = $derived(props.class ?? 'size-5')
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class={className} aria-hidden="true">
	<path fill-rule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd" />
</svg>
