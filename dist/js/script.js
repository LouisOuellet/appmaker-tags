API.Plugins.tags = {
	element:{
		table:{
			index:{},
		},
	},
	init:function(){
		API.GUI.Sidebar.Nav.add('tags', 'development');
		var isInitialized = setInterval(function() {
			if(API.initiated){
				clearInterval(isInitialized);
				for(var [key, plugin] of Object.entries(['organizations','leads','my_leads','my_prospects','clients','my_clients'])){
					API.Plugins.tags.customize(plugin);
				}
			}
		}, 100);
	},
	customize:function(plugin){
		if(API.Helper.isSet(API.Contents,['Settings','plugins',plugin,'status']) && API.Contents.Settings.plugins[plugin].status){
			var isInitialized = setInterval(function() {
				if(API.Helper.isSet(API.Plugins,[plugin,'forms','create'])){
					clearInterval(isInitialized);
					var id = 0;
					for(var [key, value] of Object.entries(API.Plugins[plugin].forms.create)){
						if(API.Helper.isInt(key)){ id = key; }
					}
					id++;
					API.Plugins[plugin].forms.create[id] = "tags";
				}
			}, 100);
		}
	},
	load:{
		index:function(){
			API.Builder.card($('#pagecontent'),{ title: 'Tags', icon: 'tags'}, function(card){
				API.request('tags','read',{
					data:{options:{ link_to:'TagsIndex',plugin:'tags',view:'index' }},
				},function(result) {
					var dataset = JSON.parse(result);
					if(dataset.success != undefined){
						for(const [key, value] of Object.entries(dataset.output.dom)){ API.Helper.set(API.Contents,['data','dom','tags',value.name],value); }
						for(const [key, value] of Object.entries(dataset.output.raw)){ API.Helper.set(API.Contents,['data','raw','tags',value.name],value); }
						API.Builder.table(card.children('.card-body'), dataset.output.dom, {
							headers:dataset.output.headers,
							id:'TagsIndex',
							modal:true,
							key:'name',
							clickable:{ enable:true, view:'details'},
							controls:{ toolbar:true},
							import:{ key:'id', },
						},function(response){
							API.Plugins.tags.element.table.index = response.table;
						});
					}
				});
			});
		},
		details:function(){
			var url = new URL(window.location.href);
			var id = url.searchParams.get("id"), values = '';
			setTimeout(function() {
				$("[data-plugin="+url.searchParams.get("p")+"][data-key]").each(function(){
					values += $(this).html();
				});
				if(values == ''){
					API.request('tags','read',{data:{id:id,key:'name'}},function(result){
						var dataset = JSON.parse(result);
						if(dataset.success != undefined){
							API.GUI.insert(dataset.output.dom);
						}
					});
				}
			}, 1000);
		},
	},
	Layouts:{
		details:{
			detail:function(data,layout,options = {},callback = null){
				if(options instanceof Function){ callback = options; options = {}; }
				var url = new URL(window.location.href);
				var defaults = {field: "tags", plugin:url.searchParams.get("p")};
				for(var [key, option] of Object.entries(options)){ if(API.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
				API.Builder.Timeline.add.filter(layout,'tags','Tags');
				if(!API.Helper.isSet(layout,['details','tags'])){
					API.GUI.Layouts.details.data(data,layout,defaults,function(data,layout,tr){
						var td = tr.find('td[data-plugin="'+url.searchParams.get("p")+'"][data-key="tags"]');
						td.html('');
						if(API.Helper.isSet(data,['this','raw','tags'])){
							for(var [id, tag] of Object.entries(data.this.raw.tags.split(';'))){
								td.prepend(API.Plugins.tags.Layouts.details.GUI.button(tag,{remove:API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
							}
							if(API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 2)){
								td.append('<button type="button" class="btn btn-xs btn-success mx-1" data-action="tag"><i class="fas fa-plus"></i></button>');
							}
						}
						if(API.Helper.isSet(data,['this','raw','meta'])){
							for(var [id, tag] of Object.entries(JSON.parse(data.this.raw.meta))){
								tag = tag.split(':');
								td.prepend(API.Plugins.tags.Layouts.details.GUI.button(tag,{remove:API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
							}
							if(API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 2)){
								td.append('<button type="button" class="btn btn-xs btn-success mx-1" data-action="tag"><i class="fas fa-tag"></i></button>');
							}
						}
						API.Plugins.tags.Layouts.details.Events(data,layout);
						if(callback != null){ callback(data,layout,tr); }
					});
				} else {
					var td = layout.details.tags.find('td[data-plugin="'+url.searchParams.get("p")+'"][data-key="tags"]');
					// if(API.Helper.isSet(data,['this','raw','tags'])){
					// 	for(var [id, organization] of Object.entries(data.relations.tags)){
					// 		if(organization.isActive || API.Auth.validate('custom', 'tags_isActive', 1)){
					// 			td.append(API.Plugins.tags.Layouts.details.GUI.button(organization,{remove:API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
					// 		}
					// 	}
					// 	if(API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 2)){
					// 		td.append('<button type="button" class="btn btn-xs btn-success mx-1" data-action="link"><i class="fas fa-link"></i></button>');
					// 	}
					// }
					// if(API.Helper.isSet(data,['relations','tags'])){
					// 	for(var [id, organization] of Object.entries(data.relations.tags)){
					// 		if(td.find('div.btn-group[data-id="'+organization.id+'"]').length <= 0){
					// 			if(organization.isActive || API.Auth.validate('custom', 'tags_isActive', 1)){
					// 				td.prepend(API.Plugins.tags.Layouts.details.GUI.button(organization,{remove:API.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
					// 			}
					// 		}
					// 	}
					// }
				}
			},
			GUI:{
				button:function(tag,options = {},callback = null){
					var url = new URL(window.location.href);
					if(options instanceof Function){ callback = options; options = {}; }
					var defaults = {remove: false};
					for(var [key, option] of Object.entries(options)){ if(API.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
					if(tag instanceof Array){
						var html = '<div class="btn-group m-1" data-tag="'+tag[tag.length-1]+'">';
							html += '<button type="button" class="btn btn-xs bg-primary" data-category="'+tag[0]+'"><i class="fas fa-barcode mr-1"></i>'+tag[0]+'</button>';
							html += '<button type="button" class="btn btn-xs bg-default" data-tag="'+tag[tag.length-1]+'" data-action="pastebin"><i class="fas fa-tag mr-1"></i>'+tag[tag.length-1]+'</button>';
							if(defaults.remove){
								html += '<button type="button" class="btn btn-xs bg-danger" data-tag="'+tag[tag.length-1]+'" data-action="untag"><i class="fas fa-trash-alt"></i></button>';
							}
						html += '</div>';
					} else {
						var html = '<div class="btn-group m-1" data-tag="'+tag+'">';
							html += '<button type="button" class="btn btn-xs bg-primary" data-tag="'+tag+'" data-action="pastebin"><i class="fas fa-tag mr-1"></i>'+tag+'</button>';
							if(defaults.remove){
								html += '<button type="button" class="btn btn-xs bg-danger" data-tag="'+tag+'" data-action="untag"><i class="fas fa-trash-alt"></i></button>';
							}
						html += '</div>';
					}
					if(callback != null){ callback(dataset,html); }
					return html;
				},
			},
			Events:function(data,layout,options = {},callback = null){
				var url = new URL(window.location.href);
				if(options instanceof Function){ callback = options; options = {}; }
				var defaults = {};
				for(var [key, option] of Object.entries(options)){ if(API.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
				if(callback != null){ callback(dataset,layout); }
			},
		},
	},
}

API.Plugins.tags.init();
