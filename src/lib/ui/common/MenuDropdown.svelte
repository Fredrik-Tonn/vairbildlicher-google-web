<script lang="ts">
	import EllipsisVerticalSolid from '$lib/ui/assets/EllipsisVerticalSolid.svelte'

	let { 
		onNewChat, 
		inputDisabled = false,
		showNewChat = true
	}: { 
		onNewChat?: () => void, 
		inputDisabled?: boolean,
		showNewChat?: boolean
	} = $props()
	
	let showMenuDropdown = $state(false)
	let menuButtonRef: HTMLButtonElement | undefined = $state()
	let menuContainerRef: HTMLDivElement | undefined = $state()
	
	const toggleMenuDropdown = () => {
		showMenuDropdown = !showMenuDropdown
	}
	
	const handleNewChat = () => {
		showMenuDropdown = false
		if (onNewChat) {
			onNewChat()
		}
	}
	
	// Close menu on outside click
	$effect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showMenuDropdown && menuContainerRef && !menuContainerRef.contains(event.target as Node)) {
				showMenuDropdown = false
			}
		}
		
		document.addEventListener('click', handleClickOutside)
		
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

<style>
	.menu-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, background-color 0.2s;
		border-radius: 0.5rem;
		position: relative;
	}
	
	.menu-btn:hover:not(:disabled) {
		background-color: #f3f4f6;
	}
	
	.menu-btn:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.menu-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	/* Menu Dropdown Styles */
	.menu-dropdown {
		position: absolute;
		top: calc(100% + 12px);
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		min-width: 200px;
		z-index: 50;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s, visibility 0.2s;
	}
	
	.menu-dropdown.show {
		opacity: 1;
		visibility: visible;
	}
	
	.menu-dropdown::before {
		content: '';
		position: absolute;
		top: -6px;
		right: 16px;
		width: 12px;
		height: 12px;
		background: white;
		border-left: 1px solid #e5e7eb;
		border-top: 1px solid #e5e7eb;
		transform: rotate(45deg);
	}
	
	.menu-item {
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		font-size: 0.9375rem;
		color: #374151;
		text-decoration: none;
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		font-family: inherit;
	}
	
	.menu-item:first-child {
		border-radius: 0.75rem 0.75rem 0 0;
	}
	
	.menu-item:last-child {
		border-radius: 0 0 0.75rem 0.75rem;
	}
	
	.menu-item:hover {
		background-color: #f9fafb;
	}
	
	.menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
	
	.menu-separator {
		height: 1px;
		background-color: #e5e7eb;
		margin: 0.25rem 0;
	}
	
	/* Desktop styles */
	@media (min-width: 768px) {
		.menu-dropdown {
			min-width: 220px;
		}
	}
	
	/* Mobile responsiveness */
	@media (max-width: 767px) {
		.menu-dropdown {
			min-width: 180px;
		}
		
		.menu-item {
			padding: 0.625rem 0.875rem;
			font-size: 0.875rem;
		}
	}
</style>

<div style="position: relative;" bind:this={menuContainerRef}>
	<button 
		bind:this={menuButtonRef}
		class="menu-btn"
		onclick={toggleMenuDropdown}
		disabled={inputDisabled}
		aria-label="Menü öffnen"
		type="button"
	>
		<EllipsisVerticalSolid class="w-6 h-6 text-gray-700" aria-hidden="true" />
	</button>
	
	<!-- Menu Dropdown -->
	<div class="menu-dropdown {showMenuDropdown ? 'show' : ''}">
		{#if showNewChat && onNewChat}
			<button 
				class="menu-item {inputDisabled ? 'disabled' : ''}"
				onclick={handleNewChat}
				disabled={inputDisabled}
				type="button"
			>
				Neuer Chat
			</button>
			<div class="menu-separator"></div>
		{/if}
		<a
			href="https://kopfhandundfuss.de/impressum/"
			class="menu-item"
			target="_blank"
			rel="noopener noreferrer"
		>
			Impressum
		</a>
		<a
			href="https://kopfhandundfuss.de/datenschutz/" 
			class="menu-item"
			target="_blank"
			rel="noopener noreferrer"
		>
			Datenschutz
		</a>
		<a
			href="https://kopfhandundfuss.de/nutzungsbedingungen-verainfacher/"
			class="menu-item"
			target="_blank"
			rel="noopener noreferrer"
		>
			Nutzungsbedingungen
		</a>
		<a
			href="https://wkf.ms/4ocMBTz"
			class="menu-item"
			target="_blank"
			rel="noopener noreferrer"
		>
			Bewertung abgeben
		</a>
		<a
			href="https://kopfhandundfuss.de/projekte/der-verainfacher/"
			class="menu-item"
			target="_blank"
			rel="noopener noreferrer"
		>
			Hilfe
		</a>
	</div>
</div>
