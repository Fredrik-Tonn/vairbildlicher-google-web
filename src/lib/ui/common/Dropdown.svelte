<script lang="ts">
	import { type Component } from 'svelte'
	import { createMenu } from 'svelte-headlessui'
	import Transition from 'svelte-transition'
	import type { SVGProps } from '$lib/ui'
	
	let { MenuButtonIcon, menuItemGroups, disabled, onSelectItem }:
		{ MenuButtonIcon: Component, menuItemGroups: Array<Array<{ icon: Component<SVGProps>, text: string}>>,
			disabled: boolean, onSelectItem: (selected: string) => void } = $props()

	const menu = createMenu({ label: 'Actions' })
	// onMount(menu.open)

	function onChange(e: Event) {
		const selected = (e as CustomEvent).detail.selected
		if (selected) {
			onSelectItem(selected)
		}
	}
</script> 

<div class="relative inline-block text-left">
	<div>
		<button
			use:menu.button
			onchange={onChange}
			{disabled}
			type="button"
			class="flex items-center cursor-pointer"
		>
			<MenuButtonIcon class="size-6 text-stone-500"></MenuButtonIcon>
			<span class="sr-only">Optionen öffnen</span>
		</button>
	</div>

	<!-- Dropdown menu, show/hide based on menu state. -->
	<Transition
		show={$menu.expanded}
		enter="transition ease-out duration-100"
		enterFrom="transform opacity-0 scale-95"
		enterTo="transform opacity-100 scale-100"
		leave="transition ease-in duration-75"
		leaveFrom="transform opacity-100 scale-100"
		leaveTo="transform opacity-0 scale-95"
	>
		<div
			use:menu.items
			class="absolute bottom-0 left-0 z-10 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
			aria-orientation="vertical"
		>
			{#each menuItemGroups as group}
				<div class="py-1">
					{#each group as option}
						{@const active = $menu.active === option.text}
						<!-- svelte-ignore a11y_missing_attribute -->
						<a
							use:menu.item
							class="group flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer {active
								? 'bg-gray-100 text-gray-900 outline-hidden'
								: 'text-gray-700'}"
						>
							<option.icon {active} class="mr-3 size-5 ${active ? 'text-gray-500' : 'text-gray-400'}" />
							{option.text}
						</a>
					{/each}
				</div>
			{/each}
		</div>
	</Transition>
</div>
