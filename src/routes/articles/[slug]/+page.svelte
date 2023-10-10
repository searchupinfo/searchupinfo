<script>
	import { marked } from 'marked';

	export let data;
</script>

<svelte:head>
	<title>{data.props.articleName}</title>
	<meta name="description" content="SearchUpInfo" />
</svelte:head>

<section>
	{#await data.props.articleText}
	Generating...
	{:then value}
	<p>{@html marked(value)}</p>
	{/await}
</section>
