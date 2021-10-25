API.Plugins.tags = {
	element:{
		table:{
			index:{},
		},
	},
	init:function(){
		API.GUI.Sidebar.Nav.add('tags', 'development');
		var isAPIInitialized = setInterval(function() {
			if(API.initiated){
				clearInterval(isAPIInitialized);
				for(var [key, plugin] of Object.entries(['organizations','leads','my_leads','my_prospects','clients','my_clients'])){
					if(API.Helper.isSet(API.Contents,['Settings','plugins',plugin,'status']) && API.Contents.Settings.plugins[plugin].status){
						var isInitialized = setInterval(function() {
							if(API.Helper.isSet(API.Plugins,[plugin,'forms','create'])){
								clearInterval(isInitialized);
								API.Plugins[plugin].forms.create.tags = { 0:"tags" }
								console.log(API.Plugins[plugin].forms.create.tags);
								clearInterval(isInitialized);
							}
						}, 100);
					}
				}
			}
		}, 100);
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
	extend:{},
}

API.Plugins.tags.init();
