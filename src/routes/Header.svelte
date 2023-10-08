<script>
	import { goto } from '$app/navigation';

	let searchQuery = '';
	
	function handleSearch() {
		goto(`/${searchQuery}`);
	}
	
	function handleHome() {
		goto('/');
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
</script>

<header>
	<div class="home">
		<button on:click={handleHome}>Home</button>
	</div>
	<div class="search">
		<input type="text" placeholder="Search..." bind:value={searchQuery} on:keypress={handleKeyPress} />
		<button on:click={handleSearch}>Search</button>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		background-color: #f0f0f0;
	}

	.home button {
		border: none;
		outline: none;
		background-color: transparent;
		color: black;
		font-size: 1.2rem;
		cursor: pointer;
	}

	.search {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.search input[type="text"] {
		border: none;
		outline: none;
		flex: 1;
		margin-right: 1rem;
		height: 30px;
		border-radius: 3px;
	}

	.search button {
		border: none;
		outline: none;
		background-color: #007acc;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		cursor: pointer;
	}
</style>