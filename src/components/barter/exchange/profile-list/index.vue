<template>
	<ExchangeList
		:tags="account?.tags || []"
		:editable="isMyProfile"
		:hasRelay="account?.relay"
		@change="(tags) => account.set({ tags })"
	>
		<template #edit="{ instance }">
			<!-- Edit button -->
			<template v-if="!instance.editing">
				<v-button 
					vType="bulma-stroke" 
					:disabled="account?.relay"
					@click="instance.edit"
				>
					{{ $t('buttonLabels.edit') }}
				</v-button>
			</template>

			<!-- Cancel and Save buttons -->
			<template v-else>
				<div class="buttons-holder">
					<v-button 
						vType="chi-chi" 
						@click="instance.cancel"
					>
						{{ $t('buttonLabels.cancel') }}
					</v-button>

					<v-button 
						:disabled="account?.relay"
						@click="instance.save"
					>
						{{ $t('buttonLabels.save') }}
					</v-button>
				</div>
			</template>
		</template>

		<template #after v-if="account?.relay && account?.isRelayProp('tags')">
			<label class="v-label warning-level">
				<i class="fa fa-spinner fa-spin"></i>
				{{ $t("profileLabels.profile_is_being_updated") }}
			</label>
		</template>
	</ExchangeList>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>