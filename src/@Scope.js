function Scope(parent, type) {
  this.parent = parent;
  this.type = type;
  this.scs =
    this.isConcrete() ? this : this.parent.scs;
  this.refs = {};
  for (var i = 0; i < RT.length;i++)
    this.refs[RT[i]] = new SortedObj({});

  var baseDecl = null; 
  if (this.parent)
    baseDecl = createObj(this.parent.allDecls.obj);
  else
    baseDecl = {};

  this.allDecls =
    this.isConcrete() ? new SortedObj(baseDecl) : this.scs.allDecls;

  this.ownDecls = new SortedObj(baseDecl);

  this.name2id = {};
} 
