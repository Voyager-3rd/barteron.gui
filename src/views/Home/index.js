import AssocList from "@/components/categories/assoc-list/index.vue";
import BarterList from "@/components/barter/list/index.vue";
import Banner from "@/components/banner/index.vue";

export default {
	name: "Home",

	inject: ["favorite"],

	components: {
		AssocList,
		BarterList,
		Banner
	},

	data() {
		return {
			categories: this.favorite
		}
	}
}