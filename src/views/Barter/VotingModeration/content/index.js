import Loader from "@/components/loader/index.vue";
import Profile from "@/components/profile/index.vue";
import Score from "@/components/score/index.vue";

export default {
	name: "Content",

	components: {
		Loader,
		Profile,
		Score,
	},

	inject: ["dialog"],

	data() {
		return {
			accessStatusVariant: null,
			isLoading: false,
			isChatLoading: false,
			requestCompleted: false,
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
			return Number(this.$route.query.score);
		},

		isModerator() {
			const 
				settings = this.sdk.getSupportSettings(),
				addresses = settings.moderatorAddresses;

			return addresses.includes(this.address);
		},
	},

	methods: {
		checkVotingModerationData() {
			if (!(this.sdk.metaDataAvailable())) {
				const error = new Error(this.$t("dialogLabels.account_meta_data_availability_error"));
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
				if (options?.completeRequest) {
					this.requestCompleted = true;
				};
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
		},

		changeAccessStatusVariant(value) {
			const options = [
				"allowed",
				"rejected",
			];

			const isValid = options.includes(value);
			if (isValid) {
				this.accessStatusVariant = value;
			};
		},

		execute() {
			if (!(this.checkVotingModerationData())) return;

			const canUpdateAccount = !(this.account.relay);
			if (!(canUpdateAccount)) {
				this.showWarning(this.$t("votingModerationLabels.cannot_execute_while_account_is_updating"));
				return;
			};

			const 
				metaData = JSON.parse(JSON.stringify(this.account?.metaData || {})),
				votingModeration = metaData.votingModeration || {},
				accessItems = votingModeration.accessItems || [];

			const newItem = {
				createdAt: Date.now(),
				offerId: this.offer.hash,
				userAddress: this.userAddress,
				score: this.score,
				status: this.accessStatusVariant,
			};

			accessItems.push(newItem);

			votingModeration.accessItems = accessItems;
			metaData.votingModeration = votingModeration;

			this.isLoading = true;

			this.account.set({ metaData }).then(() => {
				const messages = [ this.sdk.appLink(`barter/${ this.offer.hash }`) ];
				if (newItem.status === "allowed") {
					messages.push(this.$t("votingModerationLabels.request_allowed_message", {score: newItem.score}));
				} else if (newItem.status === "rejected") {
					messages.push(this.$t("votingModerationLabels.request_rejected_message"));

					this.$refs.rejectionReason.trimContent();
					const rejectionReason = this.$refs.rejectionReason.content;
					if (rejectionReason) {
						messages.push(this.$t("votingModerationLabels.rejection_reason_message", {rejectionReason}));
					};
				};

				this.sendVotingModerationMessage(messages, {completeRequest: true});
			}).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isLoading = false;
			});

		},
	},

	mounted() {

	},

}