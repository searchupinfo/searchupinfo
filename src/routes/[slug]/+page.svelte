<script>
	export let data;

	import { marked } from 'marked';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<p>{@html marked(data.props.response)}</p>
</section>
