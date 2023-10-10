<script>
	import { marked } from 'marked';

	export let data;
</script>

<svelte:head>
	<title>{data.props.articleName}</title>
	<meta name="description" content="SearchUpInfo" />
</svelte:head>

<section>
	<p>{@html marked(data.props.articleText)}</p>
</section>
