<script lang="ts">
    import type { PageData } from '$houdini';
    export let data: PageData

    $: ({ GetPrompts } = data) 
    
</script>

{JSON.stringify($GetPrompts.data)}