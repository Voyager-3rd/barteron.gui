// import AppErrors from "@/js/appErrors.js";
// import Loader from "@/components/loader/index.vue";
// import SafeDealStore from "@/stores/safeDeal.js";
import Profile from "@/components/profile/index.vue";
import Score from "@/components/score/index.vue";
// import SafeDealStatus from "@/components/safe-deal/safe-deal-status/index.vue";
// import SafeDealUtils from "@/js/safeDealUtils.js";

export default {
	name: "Content",

	components: {
		// Loader,
		Profile,
		Score,
		// SafeDealStatus,
	},

	inject: ["dialog"],

	data() {
		return {
			// statusesLoading: false,
			// statusesLoadingError: null,
			// statusItems: [],
			// currentStatus: "",
			// buyerCheckStatus1Enabled: false,
			// status1BuyerSafeDealValue: 0,
			// validatorCheckStatus2Enabled: false,
			// status2ValidatorDealResultVariant: "",
			// txFromBuyerToValidator: [],
			// txFromValidatorToSeller: [],
			// txFromValidatorToBuyer: [],
			// waitingForPaymentConfirmation: false,
		}
	},

	computed: {
		offer() {
			return this.sdk.barteron.offers[this.$route.query?.offer];
		},

		userAddress() {
			return this.$route.query.user;
		},

		score() {
			return this.$route.query.score;
		},

		userHasAccess() {
			const 
				settings = this.sdk.getSupportSettings(),
				addresses = settings.moderatorAddresses;

			return addresses.includes(this.address);
		},
	},

	methods: {
		checkVotingModerationData() {
			if (!(this.sdk.metaDataAvailable())) {
				const error = new Error(this.$t("dialogLabels.get_from_to_transactions_availability_error"));
				this.showError(error, null, () => {
					this.showOffer();
				});
				return false;
			};

			const settings = this.sdk.getSupportSettings();
			if (!(settings.moderatorAddresses.includes(this.address))) {
				const error = new Error("Moderator address is invalid");
				this.showError(error);
				return false;
			};

			return true;
		},

		openVotingModerationRoom() {
			if (this.sdk.willOpenRegistration()) return;

			if (!(this.checkVotingModerationData())) return;

			const data = {
				name: this.offer?.caption,
				members: [this.userAddress],
			};

			this.isChatLoading = true;
			this.openRoom(data).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isChatLoading = false;
			});
		},
		
		sendVotingModerationMessage(
			messages = [], 
			options = {}
		) {
			if (this.sdk.willOpenRegistration()) return;

			if (!(this.checkVotingModerationData())) return;

			const data = {
				name: this.offer?.caption,
				members: [this.userAddress],
				messages: (messages || []),
				openRoom: (options?.openRoom ?? true),
			};

			const sendingOptions = {disableNotifications: false};

			const 
				defaultDialogMessage = data.openRoom ? 
					this.$t("dialogLabels.opening_room")
					: this.$t("dialogLabels.sending_message"),
				dialogMessage = options?.dialogMessage || defaultDialogMessage;

			this.isChatLoading = true;
			this.dialog?.instance.view("load", dialogMessage);
			this.sendMessage(data, sendingOptions).then(() => {
				this.dialog?.instance.hide();
			}).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isChatLoading = false;
			});
		},

		showOffer(options) {
			let to = {
				name: "barterItem",
				params: { id: this.offer?.hash },
			};

			this.$router.push(to).catch(e => {
				console.error(e);
				this.showVersionConflictIfNeeded(e);
			});
		}
	},

	mounted() {
		// this.$2watch("sellerAddress").then(() => {
		// 	this.updateStatus();
		// }).catch(e => {
		// 	console.error(e);
		// });
	},

	async beforeRouteUpdate(to, from, next) {
		const needUpdate = (JSON.stringify(to.query) !== JSON.stringify(from.query));
		if (needUpdate) {
			// this.updateStatus();
		};
		next();
	},
}