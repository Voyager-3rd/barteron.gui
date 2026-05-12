<template>
	<div :class="{ 'exchange': true, [`v-list-${ vSize }`]: true }">
		<div class="before" v-if="$slots.before || $scopedSlots.before">
			<slot name="before" :instance="instance"></slot>
		</div>

		<div class="v-list-holder" :class="holderClass">
			<strong class="title" v-if="title">{{
				typeof title === "string" ? title : `${ $t('barterLabels.exchange') }:`
			}}</strong>

			<slot v-if="$slots.default || $scopedSlots.default" :instance="instance"></slot>

			<!-- Tags -->
			<ul class="list">
				<li
					v-for="(id, index) in !editing ? vTags.slice(0, show) : vTags"
					:key="index"
				>{{ 
					$t(categories.items[id]?.name) || $t('buttonLabels.unknown') 
				}}<i
						v-if="editing"
						class="fa fa-times remove"
						@click="remove(index)"
					></i>
				</li>

				<!-- Empty list -->
				<li class="empty" v-if="!vTags.length && !editable">
					{{ $t('barterLabels.empty') }}
				</li>

				<!-- Toggle list -->
				<li class="toggle" v-if="visible && !editing && vTags.length > visible">
					<a
						class="link"
						href="#"
						@click.prevent="toggle"
					>
						{{ $t(`toggleLabels.${ show < vTags.length ? 'show_all' : 'hide' }`) }}
					</a>
				</li>

				<!-- Insert tag -->
				<li
					v-if="editing"
					class="add"
					@click="showCategorySelectDialog"
				>
					<i class="fa fa-plus"></i>
				</li>
			</ul>

			<!-- Tags edit -->
			<div
				v-if="editable && !editMode"
				class="edit"
			>
				<slot
					v-if="$slots.edit || $scopedSlots.edit"
					name="edit"
					:instance="instance"
				></slot>
				
				<template v-else>
					<!-- Edit button -->
					<v-button
						v-if="!editing"
						:vHtml="editText"
						:disabled="hasRelay"
						@click="edit"
					/>

					<!-- Cancel and Save buttons -->
					<div
						v-else
						class="buttons-holder"
					>
						<v-button
							vType="chi-chi"
							:vHtml="cancelText"
							@click="cancel"
						/>

						<v-button
							:vHtml="saveText"
							@click="save"
						/>
					</div>
				</template>
			</div>
		</div>

		<div class="after" v-if="$slots.after || $scopedSlots.after">
			<slot name="after" :instance="instance"></slot>
		</div>
	</div>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>