from collections import OrderedDict


tag_dictionary = {"dog": ["2MzrMpM8OKc","p4YZYSkGbP4","TWEXCYQKyDc"],
              "cat": ["5dsGWM5XGdg","iRXJXaLV0n4","CrxqTtiWxs4"],
              "happy": ["2MzrMpM8OKc","iRXJXaLV0n4","p4YZYSkGbP4"],
              "maths": ["NGMRB4O922I","09JslnY7W_k","6Lm9EHhbJAY","xopM9BFjcNo","CrxqTtiWxs4"],
              }

similarity_list = [
    ["karl","uwe", 0.22],
    ["klaus", "karl", 0.88],
    ["uwe", "klaus", 0.44],
    ["karl", "petra", 0.99]
]

ratings = [
    ["karl", "2MzrMpM8OKc", 0.75],
    ["klaus","iRXJXaLV0n4", 0.44],
    ["klaus","p4YZYSkGbP4", 0.54],
    ["uwe","2MzrMpM8OKc", 0.12],
    ["uwe","p4YZYSkGbP4", 0.65],
    ["uwe", "TWEXCYQKyDc", 0.75],
    ["uwe","iRXJXaLV0n4", 0.87],
    ["petra","2MzrMpM8OKc", 0.92],
    ["petra","TWEXCYQKyDc", 0.11]
]

username1 = "karl"
"""
functions, which should be executed once only, when the user logs in, so we extract the relevant data from the databases
"""
def get_all_similarities_for_user(username):
    result = {}
    for entry in similarity_list: # here we need a connection to the databases!
        if entry[0] == username:
            result.update({entry[1]: entry[2]})
        if entry[1] == username:
            result.update({entry[0]: entry[2]})
    return result
similarities_for_user = get_all_similarities_for_user("karl")

def get_history_for_user(username):
    result = []
    for entry in ratings: # here we need a connection to the databases!
        if entry[0] == username:
            result.append(entry[1])
    return result
history = get_history_for_user(username1)

"""
"""


"""
search for a sentence in the tags-dictionary. return a list of lists,
where the n-th list is for all videos, which appeared n times in the tags.

videos, which the user already watched, are removed.

example: "happy dog" will return
[['TWEXCYQKyDc', 'iRXJXaLV0n4'], ['2MzrMpM8OKc', 'p4YZYSkGbP4']]
because ['TWEXCYQKyDc', 'iRXJXaLV0n4'] appeared for one keyword only,
and ['2MzrMpM8OKc', 'p4YZYSkGbP4'] both appeared for both keywords.
"""
def search_dictionary(sentence):
    words = sentence.split(" ")
    results_in_dict = {}
    maximum = 0
    for word in words:
        if word in tag_dictionary:
            resultlist = tag_dictionary[word]
            for result in resultlist:
                if result not in history: #so, someone does not watch a video twice
                    if result in results_in_dict:
                        results_in_dict[result] += 1
                        maximum = max(results_in_dict[result],maximum)
                    else:
                        results_in_dict.update({result:1})
                        maximum = max(1, maximum)
    results = [[] for i in range(maximum)]
    for k, v in results_in_dict.items():
        results[v-1].append(k)
    return results


"""
returns dictionary for a video, which contains all ratings from all users for this video, in this form:
{user1 : rating(user1), user2 : rating(user2), ...}
"""
def get_all_ratings(video):
    all_ratings = {}
    for rating in ratings: # here we need a connection to the databases!
        if rating[1] == video:
            all_ratings.update({rating[0]:rating[2]})
    return all_ratings


"""
sorts a list of videos, based on the ratings of similar users
"""
def sort_results_sublist(sub_list):
    result = {}
    for video in sub_list:
        ratings_video = get_all_ratings(video)
        sum_of_weights = 0  # the similarity is used as weight
        sum_of_ratings = 0
        for user, rating in ratings_video.items():
            if user in similarities_for_user:
                sum_of_ratings += rating * similarities_for_user[user]
                sum_of_weights += similarities_for_user[user]
        if sum_of_weights > 0:
            weighted_averaged_rating = sum_of_ratings / sum_of_weights
            result.update({video:weighted_averaged_rating})
    return OrderedDict(sorted(result.items(), key=lambda t: t[1], reverse=True))

"""
sort the list of lists,
"""
def sort_results(results_from_tags):
    result = []
    for sub_list in results_from_tags:
        result += sort_results_sublist(sub_list)
    return result

"""
combination of seach in dictionary and search function.
returns search results, sorted by ratings from similar users
"""
def search(query):
    return sort_results(search_dictionary("happy dog"))

print(search("happy dog"))
