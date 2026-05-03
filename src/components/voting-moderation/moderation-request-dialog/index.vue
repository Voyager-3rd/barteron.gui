<template>
	<v-lightbox
		class="moderation-request-dialog"
		size="md"
		:visible="lightbox"
		:title="$t('moderationRequestLabels.title')"
		@onHide="hide"
	>

		<h1 class="info">
			{{ $t('moderationRequestLabels.main_info1') }}
		</h1>

		<Score
			:rating="false"
			:stars="5"
			:starsValue="score"
			:voteable="false"
		/>

		<v-form
			ref="form"
		>
			<v-textarea
				ref="reason"
				id="input-reason"
				class="field"
				name="reason"
				length="1000"
				:placeholder="$t('moderationRequestLabels.reason_placeholder')"
			>
			</v-textarea>
		</v-form>

		<p class="info">
			<i class="fa fa-chevron-circle-right"></i>
			{{ $t('moderationRequestLabels.main_info2') }}
		</p>

		<p class="info">
			<i class="fa fa-chevron-circle-right"></i>
			{{ $t('moderationRequestLabels.main_info3') }}
		</p>

		<!-- Footer -->
		<template #footer>
			<div class="row full-width right">
				<div class="buttons-holder min-h-w">
					<v-button
						@click="hide"
					>
						<span>{{ $t('buttonLabels.cancel') }}</span>
					</v-button>
					<v-button
						vType="hit"
						@click="submit"
					>
						<span>{{ $t('buttonLabels.submit') }}</span>
					</v-button>
				</div>
			</div>
		</template>
	</v-lightbox>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>