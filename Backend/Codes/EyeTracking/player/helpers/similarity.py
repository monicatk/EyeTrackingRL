import nltk

nltk.download('punkt')
from nltk.stem.porter import *
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from player.helpers.viewmodels import *
import string

token_dict = {}

stemmer = PorterStemmer()


# stem the tokens
def stem_tokens(tokens, stemmer):
    stemmed = []
    for item in tokens:
        stemmed.append(stemmer.stem(item))
    return stemmed


# tokenize content
def tokenize(text):
    tokens = nltk.word_tokenize(text)
    stems = stem_tokens(tokens, stemmer)
    return stems


def rel_videos(videos, input):
    num_video = len(videos)
    for video in videos:
        # lowercase
        lowers = video.tags.lower()
        # pure text without punctuation
        no_punctuation = lowers.translate(string.punctuation)
        # video tags documents
        token_dict[videos.index(video)] = no_punctuation
    # same operation to search input
    lowers = input.lower()
    no_punctuation = lowers.translate(string.punctuation)
    token_dict[num_video] = no_punctuation

    tfidf = TfidfVectorizer(tokenizer=tokenize, stop_words='english')
    tfidfs_video = tfidf.fit_transform(token_dict.values())
    cosine_similarities = linear_kernel(tfidfs_video[:-1], tfidfs_video[-1]).flatten()

    # return the ids of top 10 related videos
    max_num = -11
    related_docs_indices = cosine_similarities.argsort()[:max_num:-1]

    Top_videos_ids = []
    for i in related_docs_indices:
        if cosine_similarities[i] > 0:
            Top_videos_ids.append(videos[i].video_id)
    return Top_videos_ids
