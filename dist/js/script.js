Engine.Plugins.tags = {
	element:{
		table:{
			index:{},
		},
	},
	init:function(){
		Engine.GUI.Sidebar.Nav.add('tags', 'development');
		var isInitialized = setInterval(function() {
			if(Engine.initiated){
				clearInterval(isInitialized);
				for(var [key, plugin] of Object.entries(['organizations','leads','my_leads','my_prospects','clients','my_clients'])){
					Engine.Plugins.tags.customize(plugin);
				}
			}
		}, 100);
	},
	customize:function(plugin){
		if(Engine.Helper.isSet(Engine.Contents,['Settings','plugins',plugin,'status']) && Engine.Contents.Settings.plugins[plugin].status){
			var isInitialized = setInterval(function() {
				if(Engine.Helper.isSet(Engine.Plugins,[plugin,'forms','create'])){
					clearInterval(isInitialized);
					var id = 0;
					for(var [key, value] of Object.entries(Engine.Plugins[plugin].forms.create)){
						if(Engine.Helper.isInt(key)){ id = key; }
					}
					id++;
					Engine.Plugins[plugin].forms.create[id] = "tags";
				}
			}, 100);
		}
	},
	load:{
		index:function(){
			Engine.Builder.card($('#pagecontent'),{ title: 'Tags', icon: 'tags'}, function(card){
				Engine.request('tags','read',{
					data:{options:{ link_to:'TagsIndex',plugin:'tags',view:'index' }},
				},function(result) {
					var dataset = JSON.parse(result);
					if(dataset.success != undefined){
						for(const [key, value] of Object.entries(dataset.output.dom)){ Engine.Helper.set(Engine.Contents,['data','dom','tags',value.name],value); }
						for(const [key, value] of Object.entries(dataset.output.raw)){ Engine.Helper.set(Engine.Contents,['data','raw','tags',value.name],value); }
						Engine.Builder.table(card.children('.card-body'), dataset.output.dom, {
							headers:dataset.output.headers,
							id:'TagsIndex',
							modal:true,
							key:'name',
							clickable:{ enable:true, view:'details'},
							controls:{ toolbar:true},
							import:{ key:'id', },
						},function(response){
							Engine.Plugins.tags.element.table.index = response.table;
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
					Engine.request('tags','read',{data:{id:id,key:'name'}},function(result){
						var dataset = JSON.parse(result);
						if(dataset.success != undefined){
							Engine.GUI.insert(dataset.output.dom);
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
				for(var [key, option] of Object.entries(options)){ if(Engine.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
				Engine.Builder.Timeline.add.filter(layout,'tags','Tags');
				if(!Engine.Helper.isSet(layout,['details','tags'])){
					Engine.GUI.Layouts.details.data(data,layout,defaults,function(data,layout,tr){
						var td = tr.find('td[data-plugin="'+url.searchParams.get("p")+'"][data-key="tags"]');
						td.html('');
						if(Engine.Helper.isSet(data,['this','raw','tags'])){
							for(var [id, tag] of Object.entries(data.this.raw.tags.split(';'))){
								td.prepend(Engine.Plugins.tags.Layouts.details.GUI.button(tag,{remove:Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
							}
							if(Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 2)){
								td.append('<button type="button" class="btn btn-xs btn-success mx-1" data-action="tag"><i class="fas fa-tag"></i></button>');
							}
						}
						if(Engine.Helper.isSet(data,['this','raw','meta'])){
							for(var [id, tag] of Object.entries(JSON.parse(data.this.raw.meta))){
								tag = tag.split(':');
								td.prepend(Engine.Plugins.tags.Layouts.details.GUI.button(tag,{remove:Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
							}
							if(Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 2)){
								td.append('<button type="button" class="btn btn-xs btn-success mx-1" data-action="tag"><i class="fas fa-tag"></i></button>');
							}
						}
						Engine.Plugins.tags.Layouts.details.Events(data,layout);
						if(callback != null){ callback(data,layout,tr); }
					});
				} else {
					var td = layout.details.tags.find('td[data-plugin="'+url.searchParams.get("p")+'"][data-key="tags"]');
					if(Engine.Helper.isSet(data,['this','raw','tags'])){
						if(Engine.Helper.isSet(data,['this','raw','tags'])){
							for(var [id, tag] of Object.entries(data.this.raw.tags.split(';'))){
								if(td.find('div.btn-group[data-tag="'+tag+'"]').length <= 0){
									td.prepend(Engine.Plugins.tags.Layouts.details.GUI.button(tag,{remove:Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
								}
							}
						}
						if(Engine.Helper.isSet(data,['this','raw','meta'])){
							for(var [id, tag] of Object.entries(JSON.parse(data.this.raw.meta))){
								tag = tag.split(':');
								if(td.find('div.btn-group[data-tag="'+tag[tag.length-1]+'"]').length <= 0){
									td.prepend(Engine.Plugins.tags.Layouts.details.GUI.button(tag,{remove:Engine.Auth.validate('custom', url.searchParams.get("p")+'_tags', 4)}));
								}
							}
						}
						Engine.Plugins.tags.Layouts.details.Events(data,layout);
						if(callback != null){ callback(data,layout,tr); }
					}
				}
			},
			GUI:{
				button:function(tag,options = {},callback = null){
					var url = new URL(window.location.href);
					if(options instanceof Function){ callback = options; options = {}; }
					var defaults = {remove: false};
					for(var [key, option] of Object.entries(options)){ if(Engine.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
					if(tag instanceof Array){
						var html = '<div class="btn-group m-1" data-tag="'+tag[tag.length-1]+'">';
							html += '<button type="button" class="btn btn-xs bg-primary" data-category="'+tag[0]+'"><i class="fas fa-barcode mr-1"></i>'+tag[0]+'</button>';
							html += '<button type="button" class="btn btn-xs btn-default" data-tag="'+tag[tag.length-1]+'" data-action="pastebin"><i class="fas fa-tag mr-1"></i>'+tag[tag.length-1]+'</button>';
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
				for(var [key, option] of Object.entries(options)){ if(Engine.Helper.isSet(defaults,[key])){ defaults[key] = option; } }
				var td = layout.details.tags.find('td[data-plugin="'+url.searchParams.get("p")+'"][data-key="tags"]');
				td.find('button[data-action]').off().click(function(){
					var button = $(this);
					var action = button.attr('data-action');
					var tag = button.attr('data-tag');
					switch(action){
						case'pastebin':
							Engine.Helper.copyToClipboard(tag);
							break;
						default:
							console.log(action,tag,button);
							break;
					}
				});
				if(callback != null){ callback(dataset,layout); }
			},
		},
	},
}

Engine.Plugins.tags.init();
