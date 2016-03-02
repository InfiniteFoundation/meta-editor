"use strict";

meta.class("Element.ProjectWindow", "Element.Window",
{
	onCreate: function()
	{
		this.plugin = editor.plugins.ProjectWindow;

		this.content.data = {
			Projects: {
				type: "containerNamed",
				content: {
					Browser: {
						type: "container",
						content: {
							List: "@projectList"
						}
					},
					Create: "@button"
				}
			}				
		}; 

		this.browser = this.content.get("Projects.Browser.List");
		
		this.content.on("click", "Projects.Create", this.createProject.bind(this));
		this.content.on("dbClick", "Projects.Browser.list.item", this.openProject.bind(this));
		this.content.on("update", "Projects.Browser.list.item.name", this.renameProject.bind(this));
	},

	createProject: function(element)
	{
		if(this.selectedItem) {
			this.selectedItem.select = false;
		}

		var name = this.getUniqueProjectName();
		var item = this.browser.createItem(name);
		item.focus();
		item.select = true;

		this.plugin.projects[name] = {};

		editor.fileSystem.createDir(name);
	},

	openProject: function(element)
	{
		var name = element.name;

		if(!this.plugin.projects[name]) {
			console.error("(Element.ProjectWindow.openProject) No such project found: " + name);
			return;
		}

		editor.loadProject(name);
	},

	renameProject: function(element)
	{
		var projects = this.plugin.projects;

		if(projects[element.value]) {
			element.revert();
		}
		else 
		{
			projects[element.value] = projects[element.prevValue];
			delete projects[element.prevValue];
			editor.fileSystem.moveToDir(element.prevValue, element.value);
		}		
	},

	loadProjects: function()
	{
		for(var name in this.plugin.projects) {
			this.browser.createItem(name);
		}
	},

	getUniqueProjectName: function()
	{
		var key;
		var name = "Untitled";
		var index = 2;

		main_loop:
		for(;;)
		{
			for(key in this.plugin.projects) 
			{
				if(name === key) {
					name = "Untitled" + index;
					index++;
					continue main_loop;
				}
			}

			return name;
		}

		return null;
	},	

	//
	plugin: null,
	browser: null
});
