<template>
	<v-lightbox
		class="offer-scores-dialog"
		size="sm"
		:visible="lightbox"
		:title="$t('voteLabels.ratings_from_users')"
		@onHide="hide"
	>
		<ul 
			class="offer-scores-list"
		>
			<li
				v-for="(item, index) in items"
				:key="index.address"
				class="offer-score-item"
			>
				<Profile 
					:hash="item.address"
					:hideRating="true"
					:hideInfo="true"
					:compactView="true"
				/>
				<Score
					:rating="'behind'"
					:stars="1"
					:value="item.value"
				/>
			</li>
		</ul>

		<!-- Footer -->
		<template #footer>
			<div class="row full-width right">
				<div class="buttons-holder min-h-w">
					<v-button 
						@click="hide"
					>
						<span>{{ $t('buttonLabels.close') }}</span>
					</v-button>
				</div>
			</div>
		</template>
	</v-lightbox>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>