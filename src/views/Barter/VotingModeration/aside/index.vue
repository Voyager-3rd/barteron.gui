<template>
	<v-aside 
		v-if="isModerator"
		class="voting-moderation"
	>
		<!-- Profile stats -->
		<div class="box">
			<strong class="subtitle part-title">{{ $t("votingModerationLabels.user") }}</strong>
			<Profile :hash="userAddress"/>
			<div class="message">
				<v-button @click="openVotingModerationRoom">
					{{ $t('buttonLabels.open_chat') }}
				</v-button>
			</div>
		</div>
	</v-aside>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>