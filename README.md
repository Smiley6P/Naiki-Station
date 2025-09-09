1. Pertama, membuat proyek Django dengan menyiapkan nama direktori. Kemudian, saya buat virtual environtment dengan command di command prompt: python -m venv env. kemudian mengaktivasi env tersebut dengan command venv/Scripts/activate. setelah menyalakan venv, kita bisa menyiapkan dan menginstall dependencies. list dependencies yang dipakai disimpan di dalam file requirements.txt. kemudian install semua dependencies yang sudah disertakan dengan pip install -r requirements.txt. Setelah itu, buat proyek Django baru dengan nama Naiki-Station dengan perintah django-admin startproject Naiki-Station. 
Kedua, untuk menginstall aplikasi main, saya jalankan perintah python manage.py startapp main. Setelah direktori aplikasi/main terbentuk, kemudian saya daftarkan ke proyek dengan memasukkan 'main' ke list INSTALLED_APPS. 


kemudian, saya membuat model Product pada aplikasi main dengan membuka models.py di directori aplikasi main dan mengisi beberapa atribut, seperti name, price, description, thumbnail, category, is_featured dengan tipe masing-masing.




untuk membuat tampilan web, pertama saya buat folder templates di directory aplikasi main dan kemudian membuatt berkas baru bernama main.html dan ngisi berkas tersebut dengan 

# <h1>Naiki Station</h1>
# <h5>NPM: </h5>
# <p>{{ npm }}</p>
# <h5>Name: </h5>
# <p>{{ name }}<p>
# <h5>Class: </h5>
# <p>{{ class }}</p>

kemudian memodifikasi file views.py di directory aplikasi. dengan memasukkan kode:

from django.shortcuts import render
def show_main(request):
    context = {
        'npm' : '2406403482',
        'name': 'Andrew Sanjay Hasian Panjaitan',
        'class': 'PBP D'
    }

    return render(request, "main.html", context)

dan terakhir di migrate dengan menggunakan python manage.py migrate setelah membuat migrasi model  dengan command python manage.py makemigrations

Untuk mengonfigurasi routing pada proyek agar dapat menjalankan aplikasi main, pertama membentuk berkas urls.py di direktori main, dengan isi kodenya:

from django.urls import path
from main.views import show_main

app_name = 'main'

urlpatterns = [
    path('', show_main, name='show_main'),
]


kemudian modifikasi berkas urls.py di directory proyek Naiki-Station dengan isi 


from django.urls import path, include
from main.views import show_main

app_name = 'main'

urlpatterns = [
    path('', show_main, name='show_main'),
    path('', include('main.urls')),
]

Terakhir, untuk deploy ke PWS
saya pertama membuka website, pbp.cs.ui.ac.id. saya membuat project baru dan kasih nama naikistation. kemudian saya simpan username dan passwordnya. setelah create new project, saya ke environs dan mempaste isi file .env.prod. setelah itu ke direktori proyek dan membuka settings.py untuk menambahkan link web dari pws sebagai allowed_host. setelah itu kita tinggal melakukan step yang tertera di web pws.
dengan
git add. 
git remote add pws https://pbp.cs.ui.ac.id/andrew.sanjay/naikistation
git branch -M master
git push pws master

