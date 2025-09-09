from django.shortcuts import render

# Create your views here.
def show_main(request):
    context = {
        'npm' : '2406403482',
        'name': 'Andrew Sanjay Hasian Panjaitan',
        'class': 'PBP D'
    }

    return render(request, "main.html", context)