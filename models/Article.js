var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug'); // package we'll use to auto create URL slugs

var User = mongoose.model('User');

var ArticleSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, {timestamps: true, usePushEach: true});

ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});

ArticleSchema.methods.slugify = function() {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
  };

ArticleSchema.pre('validate', function (next) {
    if (!this.slug) {
        this.slugify();
    }

    next();
});  

ArticleSchema.methods.toJSONFor = function(user){
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: this.tagList,
      favorited: user ? user.isFavorite(this._id) : false,
      favoritesCount: this.favoritesCount,
      author: this.author.toProfileJSONFor(user)
    };
  };

/* Hacky way to increment/decrement favorites count.
count is deprecated and countDouments is buggy (https://jira.mongodb.org/browse/NODE-1543)
the correct way would be to query User model and get count of favorites
Ex.
return User.count({ favorites: { $in: [article._id] } }).then(function (count) {
article.favoritesCount = count;
return article.save();
});
We would also only need on method updateFavoriteCount()
Need to make sure UI does NOT clicking the favorite button if it is already
favorited to avoid duplication*/
ArticleSchema.methods.addFavoriteCount = function () {
    var article = this;
    article.favoritesCount++;
    return article.save();
};

ArticleSchema.methods.subtractFavoriteCount = function () {
    var article = this;   
    article.favoritesCount--;
    return article.save();
};

mongoose.model('Article', ArticleSchema);