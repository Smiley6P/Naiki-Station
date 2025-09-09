## Tautan Aplikasi PWS:
https://andrew-sanjay-naikistation.pbp.cs.ui.ac.id/


## Jawaban Pertanyaan
### 1. Jelaskan bagaimana cara kamu mengimplementasikan _checklist_ di atas secara _step-by-step_

Pertama, membuat proyek Django dengan menyiapkan nama direktori. Kemudian, saya buat virtual environtment dengan command di command prompt: `python -m venv env`. kemudian mengaktivasi env tersebut dengan command `venv/Scripts/activate`. setelah menyalakan venv, kita bisa menyiapkan dan menginstall dependencies. list dependencies yang dipakai disimpan di dalam file `requirements.txt`. kemudian install semua dependencies yang sudah disertakan dengan `pip install -r requirements.txt`. Setelah itu, buat proyek Django baru dengan nama Naiki-Station dengan perintah `django-admin startproject Naiki-Station`. 
Kedua, untuk menginstall aplikasi main, saya jalankan perintah `python manage.py startapp main`. Setelah direktori aplikasi/main terbentuk, kemudian saya daftarkan ke proyek dengan memasukkan 'main' ke list `INSTALLED_APPS`. 

kemudian, saya membuat model Product pada aplikasi main dengan membuka models.py di directori aplikasi main dan mengisi beberapa atribut, seperti `name`, `price`, `description`, `thumbnail`, `category`, `is_featured` dengan tipe masing-masing.

untuk membuat tampilan web, pertama saya buat folder templates di directory aplikasi main dan kemudian membuatt berkas baru bernama main.html dan ngisi berkas tersebut dengan 

```
<h1>Naiki Station</h1>
<h5>NPM: </h5>
<p>{{ npm }}</p>
<h5>Name: </h5>
<p>{{ name }}<p>
<h5>Class: </h5>
<p>{{ class }}</p>
```

kemudian memodifikasi file views.py di directory aplikasi. dengan memasukkan kode:

```
from django.shortcuts import render
def show_main(request):
    context = {
        'npm' : '2406403482',
        'name': 'Andrew Sanjay Hasian Panjaitan',
        'class': 'PBP D'
    }

    return render(request, "main.html", context)
```

dan terakhir di migrate dengan menggunakan `python manage.py migrate` setelah membuat migrasi model  dengan command `python manage.py makemigrations`

Untuk mengonfigurasi routing pada proyek agar dapat menjalankan aplikasi `main`, pertama membentuk berkas urls.py di direktori main, dengan isi kodenya:

```
from django.urls import path
from main.views import show_main

app_name = 'main'

urlpatterns = [
    path('', show_main, name='show_main'),
]

```

kemudian modifikasi berkas urls.py di directory proyek `Naiki-Station` dengan isi 


```
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),  
]
```

Terakhir, untuk **deploy ke PWS**
saya pertama membuka website, pbp.cs.ui.ac.id. saya membuat project baru dan kasih nama `naikistation`. kemudian saya simpan username dan passwordnya. setelah create new project, saya ke environs dan mempaste isi file .env.prod. setelah itu ke direktori proyek dan membuka settings.py untuk menambahkan link web dari pws sebagai allowed_host. setelah itu kita tinggal melakukan step yang tertera di web pws.
dengan
```
git add. 
git remote add pws https://pbp.cs.ui.ac.id/andrew.sanjay/naikistation
git branch -M master
git push pws master
```

### 2. Buatlah bagan yang berisi _request client_ ke web aplikasi berbasis Django beserta responnya dan jelaskan pada bagan tersebut kaitan antara `urls.py`, `views.py`, `models.py`, dan berkas `html`.

![Bagan request client](bagan.png)


### 3. Jelaskan peran `settings.py` dalam proyek Django!
File **`settings.py`** dalam proyek Django berfungsi sebagai pusat konfigurasi yang mengatur bagaimana aplikasi berjalan. Di dalamnya terdapat berbagai pengaturan penting, seperti informasi database yang digunakan, daftar aplikasi yang aktif di proyek, lokasi template dan static files (HTML, CSS, JavaScript, gambar), hingga pengaturan keamanan seperti `SECRET_KEY`, `DEBUG`, dan `ALLOWED_HOSTS`.

### 4. Bagaimana cara kerja migrasi database di Django?
Ketika menjalankan `python manage.py migrate`, Django membaca file-file migrasi (.py) dari setiap app, membandingkannya dengan catatan migrasi yang sudah tersimpan di database (django_migrations), membuat rencana migrasi yang harus dijalankan, lalu mengeksekusi operasi-operasi (create table, add column, run Python, dll.) lewat schema editor database. Setiap migrasi yang sukses akan dicatat di tabel django_migrations. Jika migrasi dijalankan dalam transaksi (umumnya iya), kegagalan akan melakukan rollback

### 5. Menurut Anda, dari semua framework yang ada, mengapa framework Django dijadikan permulaan pembelajaran pengembangan perangkat lunak?
Menurut saya, Django dijadikan permulaan pembelajaran perangkat lunak karena dia based-of Python, yang dianggap sederhana, dan kelengkapan dari framework Django itu sendiri. Python sendiri punya sintaks yang sederhana dan mudah, sehingga pemula tidak tersandung di level bahasa sebelum masuk ke konsep besar pemrograman. Django dibangun di atas Python dan memanfaatkan sifat itu untuk memberikan pengalaman belajar yang lebih halus, sehingga mahasiswa bisa fokus memahami pola pikir _structured development_ seperti pemisahan logika, data, dan tampilan lewat arsitektur MTV, tanpa harus ribet membangun segalanya dari nol. Ditambah lagi, Django terkenal karena seperti “batteries included” dimana ORM, sistem migrasi database, autentikasi, admin panel, dan perlindungan keamanan dasar sudah included, yang langsung memperlihatkan kepada pemula bagaimana aplikasi nyata dikembangkan di industri. 

### 6.  Apakah ada feedback untuk asisten dosen tutorial 1 yang telah kamu kerjakan sebelumnya?
Menurutku, arahan, tutorial, dan asistensi oleh asisten dosen sudah sangat baik dan sangat lengkap jadi benar-benar membantu kami yang tidak paham apa-apa, jadi bisa lebih baik mendapatkan informasi dan paham akan materi terutama struktur dan cara kerja Django. Terima kasih kakak-kakak asdoss 🙏