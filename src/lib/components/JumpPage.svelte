<script lang="ts">
    function jumpUp() {
        window.scrollTo(0, 0);
    }

    function jumpDown() {
        window.scrollTo(0, document.body.scrollHeight);
    }
</script>

<div class="jump-up-down-container">
	<button type="button" class="btn up" on:click={jumpUp} title="Jump to top">
		<i class="bi bi-chevron-double-up" />
    </button>

    <button type="button" class="btn up" on:click={jumpDown} title="Jump to bottom">
		<i class="bi bi-chevron-double-down" />
    </button>
</div>

<style lang="scss">
	.jump-up-down-container {
        position: fixed;
        bottom: 0;
        right: 0;

        margin-bottom: 80px;
        margin-right: 20px;

		background: $green-color-alt;
		color: white;
		padding: 0.5rem;
		border-radius: 5px;

		display: flex;
		flex-direction: column;

		width: 5rem;

		.up,
		.down {
			display: flex;
			justify-content: center;

			i {
				font-size: 20px;
			}

			&:hover {
				color: $white-color;
				cursor: pointer;
                background: $dark-green-color;

                border-radius: 5px;
			}
		}
	}
</style>
