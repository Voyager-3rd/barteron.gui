<template>
	<v-content 
		v-if="address && isModerator"
		class="voting-moderation-content"
	>

		<!-- without sidebar -->
		<div class="no-aside">
			<strong class="subtitle part-title">{{ $t("votingModerationLabels.user") }}</strong>
			<Profile :hash="userAddress"/>
			<div class="message">
				<v-button @click="openVotingModerationRoom">
					{{ $t('buttonLabels.open_chat') }}
				</v-button>
			</div>
		</div>

		<template v-if="requestCompleted">
			<strong class="subtitle">{{ $t("votingModerationLabels.request_completion_message") }}</strong>
		</template>

		<template v-else>
			<strong class="subtitle">{{ $t("votingModerationLabels.desired_score") }}</strong>

			<Score
				:rating="false"
				:stars="5"
				:starsValue="score"
				:voteable="false"
			/>

			<strong class="subtitle">{{ $t('votingModerationLabels.make_decision') }}:</strong>

			<div class="access-status-holder">
				<v-switch
					type="radio"
					name="accessStatus"
					vSize="lg"
					:value="['allowed', 'rejected']"
					:selected="accessStatusVariant"
					:label="[
						$t('votingModerationLabels.provide_access'),
						$t('votingModerationLabels.reject_request'),
					]"
					:disabled="[isLoading, isLoading]"
					@change="changeAccessStatusVariant"
				/>
			</div>

			<div class="rejection-reason-holder">
				<v-textarea
					v-if="accessStatusVariant === 'rejected'"
					ref="rejectionReason"
					id="input-rejection-reason"
					class="field"
					name="rejection-reason"
					length="1000"
					:placeholder="$t('votingModerationLabels.rejection_reason_placeholder')"
					:disabled="isLoading"
				>
				</v-textarea>
			</div>

			<v-button 
				class="execute"
				:disabled="!(accessStatusVariant) || isLoading"
				@click="execute"
			><span>{{ $t('buttonLabels.execute') }}</span>
			</v-button>

			<div class="row top-sep dir-column hints">
				<label class="v-label info-level">
					<i class="fa fa-info-circle"></i>
					{{ $t("votingModerationLabels.advice_to_moderator_part1") }}
				</label>

				<label class="v-label info-level">
					<i class="fa fa-info-circle"></i>
					{{ $t("votingModerationLabels.advice_to_moderator_part2") }}
				</label>
			</div>
		</template>

	</v-content>

	<v-content v-else-if="address && !(isModerator)">
		<section>
			<p>{{ $t('votingModerationLabels.link_for_moderator_only') }}</p>
		</section>
	</v-content>

	<v-content v-else>
		<loader type="circular" />
	</v-content>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>