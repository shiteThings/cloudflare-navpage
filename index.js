addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
	const { pathname } = new URL(request.url);

	if (pathname === '/') {
		return new Response(await renderNavigationPage(), {
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	}

	if (pathname === '/data') {
		const navigationData = await getNavigationData();
		return new Response(JSON.stringify(navigationData), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	if (pathname === '/add-category' && request.method === 'POST') {
		const requestBody = await request.json();
		const navigationData = await getNavigationData();
		const newCategory = { name: requestBody.name, sites: [] };
		navigationData.categories.push(newCategory);
		await setNavigationData(navigationData);
		return new Response(JSON.stringify({ message: 'Category added successfully' }), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	if (pathname === '/add-site' && request.method === 'POST') {
		const requestBody = await request.json();
		const navigationData = await getNavigationData();
		const { categoryIndex, siteName, siteUrl, siteIcon } = requestBody;
		navigationData.categories[categoryIndex].sites.push({ name: siteName, url: siteUrl, icon: siteIcon });
		await setNavigationData(navigationData);
		return new Response(JSON.stringify({ message: 'Site added successfully' }), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	if (pathname === '/delete-category' && request.method === 'POST') {
		const requestBody = await request.json();
		const navigationData = await getNavigationData();
		const { categoryIndex } = requestBody;
		navigationData.categories.splice(categoryIndex, 1);
		await setNavigationData(navigationData);
		return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	if (pathname === '/delete-site' && request.method === 'POST') {
		const requestBody = await request.json();
		const navigationData = await getNavigationData();
		const { categoryIndex, siteIndex } = requestBody;
		navigationData.categories[categoryIndex].sites.splice(siteIndex, 1);
		await setNavigationData(navigationData);
		return new Response(JSON.stringify({ message: 'Site deleted successfully' }), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	if (pathname === '/edit-site' && request.method === 'POST') {
		const requestBody = await request.json();
		const navigationData = await getNavigationData();
		const { categoryIndex, siteIndex, siteName, siteUrl, siteIcon } = requestBody;
		navigationData.categories[categoryIndex].sites[siteIndex] = { name: siteName, url: siteUrl, icon: siteIcon };
		await setNavigationData(navigationData);
		return new Response(JSON.stringify({ message: 'Site updated successfully' }), {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	}

	return new Response('Not Found', { status: 404 });
}

async function getNavigationData() {
	const data = await NAVIGATION_DATA.get('data');
	return data ? JSON.parse(data) : { categories: [] };
}

async function setNavigationData(data) {
	await NAVIGATION_DATA.put('data', JSON.stringify(data));
}

async function renderNavigationPage() {
	const navigationData = await getNavigationData();
	let html = '<html><head><title>导航页</title>';
	html += `
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                background-color: #f4f4f9;
                color: #333;
            }
			a {
				text-decoration: none;
				outline: none;
				font-size: 25px;
				margin-top: 10px;
			}
	
            h2 {
                color: #4A90E2;
                font-size: 24px;
                margin-bottom: 15px;
                border-bottom: 2px solid #4A90E2;
                padding-bottom: 5px;
            }
			.ca-title {
				padding: 0;
			
			}
            ul {
                list-style-type: none;
                padding-left: 0;
                display: flex;
                flex-wrap: wrap;

            }

            li {
				margin: 10px;
				 padding: 10px;
				background-color: #ffffff;
				border-radius: 5px;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;
				width: calc(10% - 20px);
				box-sizing: border-box;
				vertical-align: middle;
            }

            form {
				margin: 0;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            input,select, button {
                padding: 10px;
                margin-right: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
            }
			
			.delete-ca-btn {
				margin: 0 0 3px 10px;
				padding: 0;
				background-color: #f4f4f9;
				border: none;
				vertical-align: middle;
				color: #000000;
			}
			.delete-ca-btn:hover {
				color: #ee4b45;
			}
			
			.add-site-btn {
				margin: 0 0 3px 10px;
				background-color: #f4f4f9;
				color: black;
				border: none;
				vertical-align: middle;
				padding: 0;
			}
			.add-site-btn:hover {
				color: orange;
			}
			input:focus,
			select:focus,
			button:focus {
				border-color: #4A90E2;
				outline: none;
			}
	

            /* 模态框样式 */
            .modal {
                display: none;
                position: fixed;
                z-index: 1;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0,0,0);
                background-color: rgba(0,0,0,0.4);
                padding-top: 60px;
            }

            .modal-content {
				position: absolute; /* 相对于包含它的相对定位元素进行定位 */
				left: 50%; /* 左边距离父元素左边界的距离为父元素宽度的一半 */
				top: 50%; /* 上边距离父元素上边界的距离为父元素高度的一半 */
				transform: translate(-50%, -50%); /* 使用 transform 属性进行微调，使其完全居中 */
                background-color: #fefefe;
                margin: 5% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
            }

            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
            }

            .close:hover,
            .close:focus {
                color: black;
                text-decoration: none;
                cursor: pointer;
            }
			.item:hover {
				transform: translateY(-8px);
				box-shadow: 0 16px 32px rgba(10, 22, 41, .12);
				transition: all .3s ease;
				cursor: pointer;
			}
			//item-icon
			.item-icon {
				width: 70px; height: 70px;
			}
			//right click
			.item {
				position: relative;
			}
			.context-menu {
				display: none;
				position: absolute;
				background: #fff;
				border: 1px solid #ccc;
				padding: 5px 0;
				z-index: 1000;
			}
			
			.context-menu-item {
				padding: 5px 20px;
				cursor: pointer;
			}
			
			.context-menu-item:hover {
				background: #f0f0f0;
			}
			.opts {
				margin-top: 10px;
			}
			.opts-item {
				margin: 0 5px;
				
				background-color: #fff;
				border: none;
			}
			.opts-delete:hover {
				color: red;
			}
			.opts-edit:hover {
				color: #4A90E2;
			}
			.
			.opts-add {
				color: #f4f4f9;
			}
			.site-style {
				color: #333;
			}
			.site-style:hover {
				color: #ff6700;
			}

        </style>
        <script src="https://code.iconify.design/2/2.0.3/iconify.min.js"></script>
    `;
	html += '</head><body>';

	// 渲染添加分类表单
	html += `
        <h2>添加分类</h2>
        <form id="addCategoryForm">
            <input type="text" name="categoryName" placeholder="分类名称" required />
            <button type="submit">添加</button>
        </form>
    `;

	// 渲染添加站点按钮和模态框
	html += `
        <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <form id="addSiteForm">
                    <select class="addSelect" name="categoryIndex" required>
                        ${navigationData.categories.map((category, index) => `<option value="${index}">${category.name}</option>`).join('')}
                    </select>
                    <input type="text" name="siteName" placeholder="站点名称" required />
                    <input type="url" name="siteUrl" placeholder="站点链接" required />
                    <input type="text" name="siteIcon" placeholder="图标（Iconify 图标名称）" required />
                    <button type="submit">添加</button>
                </form>
            </div>
        </div>
    `;

	html += `
        <div id="editSiteModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeEditModal()">&times;</span>
                <h2>修改站点</h2>
                <form id="editSiteForm">
                    <input type="hidden" name="currentCategoryIndex" />
                    <input type="hidden" name="siteIndex" />
					<select name="categoryIndex" required>
						${navigationData.categories.map((category, index) => `<option value="${index}">${category.name}</option>`).join('')}
					</select>
                    <input type="text" name="siteName" placeholder="站点名称" required />
                    <input type="url" name="siteUrl" placeholder="站点链接" required />
                    <input type="text" name="siteIcon" placeholder="图标（Iconify 图标名称）" required />
                    <button type="submit">保存修改</button>
                </form>
            </div>
        </div>
    `;

	// 渲染分类和网站链接
	navigationData.categories.forEach((category, categoryIndex) => {
		html += `<h2 class="ca-title">${category.name}`;
		// 添加删除分类按钮，放在分类名称右侧
		html += `<button class = "delete-ca-btn"  onclick="deleteCategory(${categoryIndex})"><span class="iconify del-ca-iconify" data-icon = "material-symbols:delete-outline" data-inline="false" data-width="32px" data-height="32px"></span></button>
        <button class="add-site-btn" onclick = "openAddModal(${categoryIndex})"><span class="iconify" data-icon="carbon:add-filled" data-inline="false" data-width="32px" data-height="32px" ></span></button>
		</h2><ul>`;
		category.sites.forEach((site, siteIndex) => {
			html += `<li class="item">
			<div class="item-icon" onclick= "openLink(event)" >
				<span class="iconify" data-icon="${site.icon}" data-inline="false" data-width="80px" data-height="80px" ></span> 
			</div>
			<a id="link" class = "site-style" href="${site.url}" target="_blank">${site.name}</a>
			<div class = "opts">
				<button class="opts-item opts-delete" onclick="deleteSite(${categoryIndex}, ${siteIndex})"><span class="iconify" data-icon="material-symbols:delete-outline" data-inline="false" data-width="32px" data-height="32px" ></span></button>
				<button class="opts-item opts-edit" onclick="openEditModal(${categoryIndex}, ${siteIndex}, '${site.name}', '${site.url}', '${site.icon}')"><span class="iconify" data-icon="raphael:edit" data-inline="false" data-width="32px" data-height="32px" ></span></button>
			</div>
          </li>`;
		});
		html += `</ul>`;
	});

	// 添加脚本
	html += `
        <script>
		document.getElementById('addCategoryForm').addEventListener('submit', async function(event) {
			event.preventDefault();
			const categoryName = event.target.categoryName.value;
			// 检查 categoryName 是否已存在于 navigationData 的 categories 中
			let navigationData
			try {
				const response = await fetch('/data'); // 发送请求到服务器端的 '/data' 路径
				if (response.ok) {
					navigationData = await response.json(); // 解析响应的 JSON 数据
					
				} else {
					console.error('Failed to fetch navigation data:', response.statusText);
				}
			} catch (error) {
				console.error('Error fetching navigation data:', error);
			}
			const categoryExists = navigationData.categories.some(category => category.name === categoryName);
			if (!categoryExists) {
				// 发送 fetch 请求添加新分类
				const response = await fetch('/add-category', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: categoryName })
				});
		
				if (response.ok) {
					// 如果请求成功，重新加载页面
					location.reload();
				} else {
					// 处理请求失败的情况
					console.error('Failed to add category:', response.statusText);
				}
			} else {
				// 如果分类已存在，则显示提示信息
				alert('该分类已经存在，请输入不同的分类名称。');
			}
		});
		
            document.getElementById('addSiteForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                const formData = new FormData(event.target);
                const data = {
                    categoryIndex: formData.get('categoryIndex'),
                    siteName: formData.get('siteName'),
                    siteUrl: formData.get('siteUrl'),
                    siteIcon: formData.get('siteIcon')
                };
                const response = await fetch('/add-site', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) location.reload();
            });

            function deleteCategory(categoryIndex) {
                if (confirm('确定要删除该分类吗？')) {
                    fetch('/delete-category', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ categoryIndex })
                    }).then(response => {
                        if (response.ok) location.reload();
                    });
                }
            }

            function deleteSite(categoryIndex, siteIndex) {
                if (confirm('确定要删除该站点吗？')) {
                    fetch('/delete-site', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ categoryIndex, siteIndex })
                    }).then(response => {
                        if (response.ok) location.reload();
                    });
                }
            }
			async function deleteSiteEasy(categoryIndex, siteIndex) {
                   await fetch('/delete-site', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ categoryIndex, siteIndex })
                    }).then(response => {
                        if (response.ok) location.reload();
                    });
            }
            async function addSiteAsync(data) {
                await fetch('/add-site', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }).then(response => {
                    if (response.ok) location.reload();
                });
            }

            // 打开模态框
            const modal = document.getElementById("myModal");
            const span = document.getElementsByClassName("close")[0];

             function openAddModal(categoryIndex) {
                modal.style.display = "block";
				document.querySelector(".addSelect").selectedIndex = categoryIndex;
				
            }

            span.onclick = function() {
                modal.style.display = "none";
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }

            // 修改站点模态框
            const editModal = document.getElementById("editSiteModal");

            function openEditModal(categoryIndex, siteIndex, siteName, siteUrl, siteIcon) {
                editModal.style.display = "block";
                const form = document.getElementById('editSiteForm');
				form.currentCategoryIndex.value = categoryIndex;
                form.categoryIndex.value = categoryIndex;
                form.siteIndex.value = siteIndex;
                form.siteName.value = siteName;
                form.siteUrl.value = siteUrl;
                form.siteIcon.value = siteIcon;
            }

            function closeEditModal() {
                editModal.style.display = "none";
            }

            document.getElementById('editSiteForm').addEventListener('submit', async function(event) {
                event.preventDefault();
                const formData = new FormData(event.target);
				const curCaIndex = formData.get('currentCategoryIndex');
				const selectedIndex = formData.get('categoryIndex');
				const siteIndex = formData.get('siteIndex');
                const data = {
                    categoryIndex: formData.get('categoryIndex'),
                    siteName: formData.get('siteName'),
                    siteUrl: formData.get('siteUrl'),
                    siteIcon: formData.get('siteIcon')
                };

				let response;
				if(curCaIndex ===  selectedIndex ) {
					data.newProperty = 'siteIndex';
					data.anotherProperty = formData.get('siteIndex');
					response = await fetch('/edit-site', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(data)
					});
				}else {
                    console.log("start delete")
					await deleteSiteEasy(curCaIndex, siteIndex)
                    console.log("delete finish")
                    const resp = await fetch('/add-site', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (resp.ok) location.reload();               
				}
             
                if (response.ok) location.reload();
            });
			function openLink(event) {
				// 阻止默认事件，以防止 <a> 标签的默认行为
				event.preventDefault();
				// 获取当前点击的元素
				var clickedElement = event.target;
				// 如果点击的是 span 元素，将点击元素改为其父元素 div
				if (clickedElement.tagName.toLowerCase() === 'span') {
					clickedElement = clickedElement.parentElement;
				}
				// 获取 <a> 标签的链接
				var link = clickedElement.closest('.item').querySelector('a').getAttribute('href');
				// 在新标签页中打开链接
				window.open(link, '_blank');
			}
			
        </script>
    `;

	html += '</body></html>';
	return html;
}
