import { mapState } from "pinia";
import {
	default as LocaleStore,
	useLocaleStore
} from "@/stores/locale.js";

export default {
	name: "ModeratorProfile",

	components: {
		
	},

	props: {
		hash: {
			type: String,
		},
	},

	data() {
		return {
			status: null,
			editing: false,
			isLoading: false,
		}
	},

	inject: ["dialog"],

	computed: {
		...mapState(useLocaleStore, ["locale"]),

		isMyProfile() {
			return this.hash === this.sdk.address;
		},

		account() {
			return this.sdk.barteron.accounts[this.hash];
		},

		isEditable() {
			return (this.isMyProfile);
		},

		statuses() {
			return {
				available: "available",
				unavailable: "unavailable",
			}
		},

		statusItems() {
			return Object.values(this.statuses);
		},

		statusDropdownList() {
			const icons = {
				[this.statuses.available]: "fa-check-circle",
				[this.statuses.unavailable]: "fa-ban",
			};

			const items = this.statusItems.map(item => ({
				value: item,
				icon: icons[item],
				title: this.$t(`moderatorLabels.moderator_status_${ item }`),
			}));

			return items.map(item => ({
				text: `<i class='fa icon ${ item.icon } ${ item.value } '></i> <span>${ item.title }</span>`,
				value: item.value,
				selected: (item.value === this.status),
			}));
		},
		
	},

	methods: {
		fillData() {
			const votingModeration = this.account?.metaData?.votingModeration;
			this.status = votingModeration?.moderator?.status || this.statuses.unavailable;
		},

		edit() {
			this.editing = true;
		},

		save() {
			const 
				metaData = JSON.parse(JSON.stringify(this.account?.metaData || {})),
				votingModeration = metaData.votingModeration || {},
				moderator = votingModeration.moderator || {};

		
			moderator.status = this.status;
			votingModeration.moderator = moderator;
			metaData.votingModeration = votingModeration;

			this.isLoading = true;

			this.account.set({ metaData }).then(() => {
				this.editing = false;
			}).catch(e => {
				this.showError(e);
			}).finally(() => {
				this.isLoading = false;
			});
		},

		cancel() {
			this.fillData();
			this.editing = false;
		},

		selectStatusEvent(newValue) {
			const 
				newStatus = newValue?.value,
				isValid = this.statusItems.includes(newStatus);

			if (isValid) {
				this.status = newStatus;
			};
		},
	},

	mounted() {
		this.fillData();
	},

	watch: {
		account() {
			this.fillData();
		},

		locale() {
			this.$refs.status?.updateButton();
		},

		status() {
			this.$refs.status?.updateButton();
		},
	}
}