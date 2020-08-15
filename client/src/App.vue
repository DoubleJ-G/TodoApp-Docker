<template>
	<div class="container mu-10">

		<div v-if="notification.visible" class="alert notification" :class="notification.type">
			{{notification.message}}
		</div>

		<h1 class="text-center">Todo List</h1>

		<span class="form-group form-inline mb-10"> 
			<input type="text" class="form-control col-8" v-model="item_name">
			<button id ="add" type="button" class="btn btn-primary col-4" @click="addTodoItem">Add</button>
		</span>
		
		<ul class="list-group">
			<li class="list-group-item" v-for="item in items" :key="item.id">
				<span>{{ item.item_name}}</span>
				<button class="btn btn-outline-danger btn-sm float-right" @click="deleteTodoItem(item.id)">X</button>
			</li>
		</ul>

	</div>
	
</template>

<script>
import axios from 'axios';

export default {
	name: 'app',
	data: function() { 
		return { 
			item_name: '',
			items: [],
			notification: {
				visible: true,
				message: "Test notification",
				type: "alert-success"
			}
		}
	},
	computed: { 
		url() { 
			return window.location.protocol + "//" + window.location.hostname + ":3000/v1/items/";
		}
	},
	methods: { 

		addTodoItem() { 
			if (this.item_name !== "") {
				this.createTodoItem();
			}
			this.item_name="";
		},

		getTodoItems() { 
			axios.get(this.url)
				.then( data => this.items = data.data )
				.catch( error => console.log(error))
		},
		createTodoItem() { 
			axios.post(this.url, {"item_name": this.item_name}, {"content-type": "application/json"})
				.then( () => this.getTodoItems() )
				.catch( error => console.log(error.response))
		},
		deleteTodoItem(id) { 
			axios.delete(this.url + id)
				.then( () => this.getTodoItems())
				.catch( error => console.log(error))
		}
	},
	created() { 
		this.getTodoItems();
	}
}
</script>

<style>
	html, body { 
		margin: 0;
		padding: 0;
	}
	#add { 
		float: right;
	}
	.notification { 
		position: absolute;
		bottom: 10px;
		left: 10px;
	}
</style>