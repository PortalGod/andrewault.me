//where we're gonna keep stuff
var env = {
	//settings
	fov: 45, //field of view
	dpi: 48, //dots per inch
	ppc: 10, //points per curve

	//probably always true
	shouldRender: true,

	//parts
	vecs: 	{},
	verts: 	{},
	tex: 	{},
	mat: 	{},
	mesh: 	{},
	lights: {},
	canvas: {},

	//animation
	anim: 	{}
};

//threejs stuff
env.initScene = function() {
	//context
	env.scene = new THREE.Scene();

	//camera
	env.camera = new THREE.PerspectiveCamera(env.fov, env.scrW / env.scrH, 4, env.scrW * 2);

	//why is this so complicated rn
	var oa = Math.tan((env.fov / 2) * (Math.PI / 180));
	var a = (1 / oa) * (env.scrH / 2);

	env.camera.position.y = a;
	env.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

	//env.controls = new THREE.EditorControls(env.camera);

	env.clock = new THREE.Clock();

	env.renderer = new THREE.WebGLRenderer({antialias: true});
	env.renderer.setSize(env.scrW, env.scrH);
	env.renderer.setClearColor(0xffffff);
	env.renderer.shadowMap.enabled = true;
}

env.pageVerts = function(frac) {
	var curve = new THREE.CurvePath();
	var detail = 40;

	curve.add(new THREE.CubicBezierCurve(
		new THREE.Vector2(0, 				0),
		new THREE.Vector2(0, 				0),
		new THREE.Vector2(0, 				0.5 * frac * env.dpi),
		new THREE.Vector2(1 * env.dpi, 		0.5 * frac * env.dpi)
	));

	curve.add(new THREE.CubicBezierCurve(
		new THREE.Vector2(1 * env.dpi, 		0.5 * frac * env.dpi),
		new THREE.Vector2(2 * env.dpi, 		0.5 * frac * env.dpi),
		new THREE.Vector2(2 * env.dpi, 		0),
		new THREE.Vector2(8.5 * env.dpi, 	0)
	));

	var plane = new THREE.PlaneGeometry(8.5 * env.dpi, 11 * env.dpi, detail, 1);
	plane.translate(4.25 * env.dpi, 0, 0);
	plane.rotateX(-Math.PI / 2);

	for(var i = 0; i < plane.vertices.length; i++) {
		var pt = curve.getPointAt((i % (detail + 1)) / (detail + 1))

		plane.vertices[i].y = pt.y;
	}

	return plane;
}

env.setupScene = function() {
	//anim settings
	var bookLeft = 0.5 * env.dpi,
		bookHeight = 0.25 * env.dpi;

	var coverSize = 16;
	var shadowFrustumSize = 11 * env.dpi;
	var shadowSize = 0.25 * env.dpi + coverSize;
	var shadowBlur = 16;

	//origin lines
	/*
	{
		var origin = new THREE.Vector3(0, 0, 0);

		env.scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, env.dpi, 0xff0000, 8, 8));
		env.scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, env.dpi, 0x00ff00, 8, 8));
		env.scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, env.dpi, 0x0000ff, 8, 8));
	}
	*/

	//lights
	{
		env.lights.directional = new THREE.DirectionalLight(0xffffff, 1);
		env.lights.directional.position.set(0, env.scrW / 2, -5.5 * env.dpi);
		env.lights.directional.position.multiplyScalar(2);

		env.scene.add(env.lights.directional);
	}

	//fake shadow
	{
		env.canvas.shadow = document.createElement('canvas');
		env.canvas.shadow.width = 1024; //env.scrW;
		env.canvas.shadow.height = 512; //env.scrH;

		document.body.appendChild(env.canvas.shadow);

		//save drawing for our book anim hook

		//putting it in a texture
		env.tex.shadow = new THREE.Texture(env.canvas.shadow);

		//making our object
		env.verts.shadow = new THREE.PlaneBufferGeometry(env.scrW, env.scrH);
		env.mat.shadow = new THREE.MeshBasicMaterial({map: env.tex.shadow});
		env.mesh.shadow = new THREE.Mesh(env.verts.shadow, env.mat.shadow);

		env.mesh.shadow.rotation.x = -Math.PI / 2;

		env.scene.add(env.mesh.shadow);
	}

	//book
	{
		env.mat.bookCover = new THREE .MeshLambertMaterial({wireframe: false, color: 0x222222, side: THREE.DoubleSide});
		env.mat.book = new THREE.MeshLambertMaterial({wireframe: false, color:0xffffff});

		env.mesh.bookCover = new THREE.Mesh({}, env.mat.bookCover);
		env.mesh.book = new THREE.Mesh({}, env.mat.book);

		env.anim.book = {
			frac: 0,
			state: 0,
			speed: 1,
			update: function() {
				var frac = this.frac,
					ifrac = 1 - this.frac;

				//first, our covers
				var coverW = 8.5 * env.dpi + coverSize - (bookHeight / 2) * frac;
				var coverH = 11 * env.dpi + coverSize * 2;

				var backCover = new THREE.PlaneGeometry(coverW, coverH);
				backCover.rotateX(-Math.PI / 2);
				backCover.translate(coverW / 2 + bookLeft * ifrac + (bookHeight / 2) * frac, 0, 0);

				//these animations suck
				var spine = new THREE.PlaneGeometry(bookHeight, coverH);
				spine.rotateX(-Math.PI / 2);

				var spineTheta = (-Math.PI / 2) * ifrac;

				spine.rotateZ(spineTheta);

				spine.translate(bookLeft * ifrac, Math.sin(-spineTheta) * (bookHeight / 2), 0);

				//aaaa
				var frontCover = new THREE.PlaneGeometry(coverW, coverH, 2, 2);
				frontCover.rotateX(Math.PI / 2);
				frontCover.scale(-1, 1, 1);

				var frontTheta = -Math.PI * ifrac;

				frontCover.rotateZ(frontTheta);

				//move on top of spine
				frontCover.translate(bookLeft * ifrac - Math.cos(spineTheta) * (bookHeight / 2), Math.sin(-spineTheta) * bookHeight, 0);
				frontCover.translate(-Math.cos(frontTheta) * coverW / 2, -Math.sin(frontTheta) * coverW / 2, 0);

				//combine
				env.verts.bookCover = new THREE.Geometry();
				env.verts.bookCover.merge(backCover);
				env.verts.bookCover.merge(spine);
				env.verts.bookCover.merge(frontCover);

				env.mesh.bookCover.geometry = env.verts.bookCover;
				env.mesh.bookCover.verticesNeedUpdate = true;

				//pages
				var back = env.pageVerts(frac);
				back.translate(bookLeft * ifrac, 1, 0);

				var front = env.pageVerts(frac);
				front.scale(-1, 1, 1);
				front.rotateZ(-Math.PI * ifrac);
				front.translate(bookLeft * ifrac, bookHeight * ifrac + 1, 0);

				//gotta fuckin flip the normals for the front
				//http://stackoverflow.com/questions/21462851/flip-normals-in-three-js-on-sphere
				for(var i = 0; i < front.faces.length; i++) {
					var face = front.faces[i];

					var temp = face.a;
					face.a = face.c;
					face.c = temp;
				}

				//add it all together
				env.verts.book = new THREE.Geometry();
				env.verts.book.merge(back);
				env.verts.book.merge(front);

				env.mesh.book.geometry = env.verts.book;
				env.mesh.book.verticesNeedUpdate = true;

				//normals
				env.mesh.book.geometry.computeFaceNormals();
				env.mesh.book.geometry.computeVertexNormals();

				//shadow
				var context = env.canvas.shadow.getContext('2d');

				var xd = 1024 / env.scrW,
					yd = 512 / env.scrH;

				//clear to white
				context.fillStyle = '#fff';
				context.fillRect(0, 0, 1024, 512);

				//math to fake our shadow
				var frontW = Math.max(Math.cos(ifrac * Math.PI) * 8.5 * env.dpi * xd, 0);

				var shadowX = 512 + (bookLeft * xd * ifrac) - frontW;
				var shadowY = 256 - 5.5 * yd * env.dpi;
				var shadowW = 8.5 * xd * env.dpi + frontW;
				var shadowH = 11 * yd * env.dpi;

				shadowX -= shadowSize / 2;
				shadowY -= shadowSize / 2;
				shadowW += shadowSize;
				shadowH += shadowSize;

				//drawing
				context.fillStyle = '#000'; //doesn't matter
				context.shadowColor = 'rgba(0, 0, 0, 0.3)';
				context.shadowBlur = shadowBlur;
				context.shadowOffsetX = shadowX + shadowW;

				context.fillRect(-shadowW, shadowY, shadowW, shadowH);

				//flag our texture as dirty
				env.tex.shadow.needsUpdate = true;
				env.mat.shadow.needsUpdate = true;
			}
		}

		//call it for the first time
		env.anim.book.update();

		env.scene.add(env.mesh.bookCover);
		env.scene.add(env.mesh.book);
		//env.scene.add(new THREE.VertexNormalsHelper(env.mesh.book, 16, 0xff0000, 1));
	}
}

//paint
env.paint = function() {
	//wtf
	if(env.paint)
		requestAnimationFrame(env.paint.bind(env));

	//update anims
	var delta = env.clock.getDelta();

	for(var key in env.anim) {
		var anim = env.anim[key];

		if(anim.state) {
			anim.frac = Math.min(anim.frac + delta * anim.speed, 1);
			anim.update();

			if(anim.frac == 1)
				anim.state = 0;
		}
	}

	//only render if we have to
	if(env.shouldRender && env.renderer)
		env.renderer.render(env.scene, env.camera); //env.lights.directional.shadow.camera);
}

//resize
env.resize = function() {
	env.scrW = window.innerWidth;
	env.scrH = window.innerHeight;

	if(env.camera && env.renderer) {
		env.camera.aspect = env.scrW / env.scrH;
		env.camera.updateProjectionMatrix();

		env.renderer.setSize(env.scrW, env.scrH);
	}
};

//let's gooo
(function() {
	//done loading
	var elem = document.getElementById("threejs");
	elem.querySelector("#loading").style.display = "none";

	//size of the canvas
	env.scrW = window.innerWidth;
	env.scrH = window.innerHeight;

	//setup our scene
	env.initScene();

	//throw it in the dom
	elem.appendChild(env.renderer.domElement);

	//add our objects
	env.setupScene();

	//start rendering
	env.paint();

	//resize hook
	window.addEventListener('resize', env.resize, false);

	//animation
	document.addEventListener('mouseup', function() {
		if(env.anim.book.frac < 1 && !env.anim.book.state)
			env.anim.book.state = 1;
	});
})()