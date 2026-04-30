<template>
	<div class="moderator-profile">

		<strong class="title">{{ $t("moderatorLabels.moderator") }}:</strong>

		<div class="row status-holder">
			<div class="col no-offset">
				<span>{{ $t("moderatorLabels.status") }}:</span>
			</div>

			<div class="col">
				<v-select
					ref="status"
					:disabled="!(editing) || isLoading"
					:dropdown="statusDropdownList"
					@selected="selectStatusEvent"
				/>
			</div>
		</div>

		<div 
			v-if="isEditable"
			class="edit"
		>
			<!-- Edit button -->
			<v-button
				v-if="!(editing)"
				vType="bulma-stroke"
				:disabled="isLoading || account?.relay"
				@click="edit"
			>
				<span>{{ $t("buttonLabels.edit") }}</span>
			</v-button>

			<!-- Cancel and Save buttons -->
			<div
				v-else
				class="buttons-holder"
			>
				<v-button
					vType="chi-chi"
					:disabled="isLoading"
					@click="cancel"
				>
					<span>{{ $t("buttonLabels.cancel") }}</span>
				</v-button>

				<v-button
					:disabled="isLoading || account?.relay"
					@click="save"
				>
					<span>{{ $t("buttonLabels.save") }}</span>
				</v-button>
			</div>
		</div>

		<label 
			v-if="account?.relay && account?.isRelayProp('votingModeration')" 
			class="v-label warning-level"
		>
			<i class="fa fa-spinner fa-spin"></i>
			{{ $t("changes_are_being_saved") }}
		</label>
	</div>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>