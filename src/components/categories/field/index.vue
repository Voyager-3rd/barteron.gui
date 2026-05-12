<template>
	<div
		:class="{
			'category-field': true,
			'filled': id,
			'focus-within': dialogVisible,
		}"
	>
		<div
			class="category-field-holder"
			@click="showCategorySelectDialog"
		>
			<ul>
				<li
					v-for="(parent, index) in catParents"
					:key="index"
				>
					{{ $t(parent.name) }}
				</li>

				<li>
					{{ $t(id && categories.items[id]?.name || 'categoriesLabels.choose') }}
				</li>
			</ul>

			<i
				:class="{
					'fa fa-times clear': true,
					'disabled': !id
				}"
				@click.stop="clear"
			></i>
		</div>

		<input
			ref="input"
			:name="name"
			:value="id"
			type="hidden"
		>
	</div>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>