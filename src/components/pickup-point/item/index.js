import Vue from "vue";
import ImageLoad from "@/components/image-load/index.vue";
import Loader from "@/components/loader/index.vue";
import SelectPickupPointDialog from "@/components/pickup-point/select-dialog/index.vue";
import Score from "@/components/score/index.vue";

export default {
	name: "PickupPointItem",

	components: {
		ImageLoad,
		Loader,
		SelectPickupPointDialog,
		Score,
	},

	inject: ['dialog', 'lightboxContainer'],
	
	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		role: { // popup, listItem
			type: String,
			required: true
		},
		mode: { // input, selection, readonly
			type: String,
			required: true
		},
		isSelected: {
			type: Boolean,
			default: false
		},
	},

	data() {
		return {
			hover: 0,
			active: 0,
			isAnimating: false,
			selectionModeButtonVType: undefined,
		}
	},

	computed: {
		isInputMode() {
			return this.mode === "input";
		},

		isSelectionMode() {
			return this.mode === "selection";
		},

		isReadonlyMode() {
			return this.mode === "readonly";
		},

		isPopupRole() {
			return this.role === "popup";
		},

		isListItemRole() {
			return this.role === "listItem";
		},
		
		/**
		 * Get author address
		 * 
		 * @returns {String}
		 */
		address() {
			return this.item.address;
		},

		/**
		 * Show is this offer is owner's
		 * 
		 * @returns {Boolean}
		 */
		isMyOffer() {
			return this.address === this.sdk.address;
		},

		/**
		 * Get owner account
		 * 
		 * @returns {@Account}
		 */
		ownerAccount() {
			return this.sdk.barteron.accounts[this.address];
		},
		
		/**
		 * Get pickup point data
		 * 
		 * @returns {Object}
		 */
		pickupPoint() {
			return this.item.delivery?.pickupPoint;
		},

		/**
		 * About self pickup info
		 * 
		 * @returns {String}
		 */
		aboutSelfPickupInfo() {
			let result = "";
			if (this.item.isSelfPickup) {
				result = this.item.additionalInfo 
					? this.$t("deliveryLabels.self_pickup_additional_info_exists")
					: this.$t("deliveryLabels.no_self_pickup_additional_info");
			}
			return result;
		},

		/**
		 * Decode offer geohash
		 * 
		 * @returns {Array|null}
		 */
		geohash() {
			return this.decodeGeoHash(this.item.geohash);
		},

		/* Get offer images */
		images() {
			return (this.item.images || []).map(url => this.sdk.manageBastyonImageSrc(url));
		},

		averageOfferScore() {
			return this.sdk.barteron.averageOfferScores[this.item.hash];
		},

		/**
		 * Show is offer has published
		 * 
		 * @returns {Boolean}
		 */
		hasRelay() {
			return this.item.relay;
		},

		/**
		 * Checking removed status
		 * 
		 * @returns {Boolean}
		 */
		isRemoved() {
			return this.item.status === "removed";
		}
	},

	methods: {
		showItem() {
			this.showDialog();
			this.$emit("showItem", this.item);
		},

		showDialog() {
			let actionButtonSettings = undefined;
			if (this.isInputMode) {
				actionButtonSettings = {
					i18nKeys: {
						regular: "select",
						isSelected: "cancel",
					},
					vType: {
						regular: undefined,
						isSelected: "hit",
					}
				};
			} else if (this.isSelectionMode) {
				if (this.isPopupRole) {
					actionButtonSettings = {
						i18nKeys: {
							regular: "buy",
							isSelected: "buy",
						},
						vType: {
							regular: "hit",
							isSelected: "hit",
						}
					};
				} else {
					actionButtonSettings = {
						i18nKeys: {
							regular: "select",
							isSelected: "buy",
						},
						vType: {
							regular: undefined,
							isSelected: "hit",
						}
					};
				}
			};

			var ComponentClass = Vue.extend(SelectPickupPointDialog);
			var instance = new ComponentClass({
				propsData: {
					item: this.item,
					isSelected: this.isSelected,
					mode: this.mode,
					actionButtonSettings,
				},
			});
			
			instance.$on('onDialogAction', vm => {
				this.dialogAction();
			});

			instance.$mount();
			this.lightboxContainer().appendChild(instance.$el);
			this.$nextTick(() => {
				instance.show();
			});
		},

		dialogAction() {
			if (!(this.isReadonlyMode)) {
				if (this.isInputMode) {
					if (this.isSelected) {
						this.unselectItem();
					} else {
						this.selectItem();
					}
				};

				if (this.isSelectionMode) {
					if (this.isPopupRole) {
						this.buyAtItem();
					} else {
						if (this.isSelected) {
							this.buyAtItem();
						} else {
							this.selectItem();
						}
					}
				};
			};
		},

		animateSelection() {
			const needAnimate = (
				this.isSelectionMode 
				&& this.isListItemRole 
				&& !(this.isAnimating)
			);

			if (needAnimate) {
				this.isAnimating = true;

				const delay = (ms) => {
					return new Promise(resolve => setTimeout(resolve, ms));
				};

				delay(100).then(() => {
					this.selectionModeButtonVType = "bulma-stroke";
					return delay(300);
				}).then(() => {
					this.selectionModeButtonVType = undefined;
					return delay(300);
				}).then(() => {
					this.isAnimating = false;
				});
			};
		},

		selectItem() {
			this.$emit("selectItem", this.item);
		},

		unselectItem() {
			this.$emit("unselectItem", this.item);
		},

		buyAtItem() {
			this.$emit("buyAtItem", this.item);
		},
	},
}