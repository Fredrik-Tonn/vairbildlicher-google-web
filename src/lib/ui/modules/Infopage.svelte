<script lang="ts">
	import MenuDropdown from '$lib/ui/common/MenuDropdown.svelte'
	import QuestionMarkCircle from '$lib/ui/assets/QuestionMarkCircle.svelte'
	import HelpLink from '$lib/ui/common/HelpLink.svelte'
</script>

<div class="bg-white px-4 lg:px-8 flex flex-col items-center justify-center pt-4 sm:pt-8 relative">
	<!-- Menu Button - fixed to viewport top right -->
	<div class="fixed top-4 right-4 z-50 inline-flex gap-10">
		<HelpLink></HelpLink>
		<MenuDropdown showNewChat={false} />
	</div>
	
	<div class="mx-auto max-w-2xl text-center mb-4 sm:mb-6">
		<div class="flex items-center justify-center gap-3 sm:gap-4">
			<h1 class="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">Verainfacher</h1>
		</div>
	</div>

	<div class="fixed bottom-6 right-6 z-50">
		<img
			src="/KHuF logo.png"
			alt="Kopf Hand und Fuss"
			class="h-12 sm:h-16 lg:h-20 w-auto select-none pointer-events-none"
		/>
	</div>
</div>
