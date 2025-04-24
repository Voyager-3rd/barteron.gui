import Loader from "@/components/loader/index.vue";
import BarterItem from "../item/index.vue";
import { Carousel, Slide } from "@/components/vue-snap/index.js";
import "@/components/vue-snap/vue-snap.css";

export default {
	name: "BarterList",

	components: {
		Loader,
		BarterItem,
		Carousel,
		Slide
	},

	props: {
		items: {
			type: Array,
			default: () => []
		},
		carousel: Boolean,
		vType: {
			type: String,
			default: "tile"
		},
		hideInfo: {
			type: Boolean,
			default: false
		},
		compactView: {
			type: Boolean,
			default: false
		},
		customLink: {
			type: [String, Object, Function],
			default: null
		},
		loaderState: Boolean,
		loaderItems: {
			type: Number,
			default: 4
		},
	},

	computed: {
		list() {
			return this.loaderState ? this.loaderItems : this.items;
		}
	},
}