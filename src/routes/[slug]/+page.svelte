<script>
	import { marked } from 'marked';

	export let data;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<p>{@html marked(data.props.response)}</p>
</section>
