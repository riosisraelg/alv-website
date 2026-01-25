# 🍞 Proyecto alv-website

![Version](https://img.shields.io/badge/version-4.1.1-blue)
![Django](https://img.shields.io/badge/Django-4.x-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RDS-blue)

Una aplicación web para seguir el rastro de las "migajas" de Serrucho.  
**Objetivo**: Recolectar 80,000 migajas 🎯

## 📁 Estructura del Proyecto

```
algoLindoVendra-alv/
├── src/
│   ├── backend/           # Django config (settings, urls, wsgi)
│   ├── migajas/           # Django app (models, views, serializers)
│   └── frontend/          # Next.js app
├── manage.py              # Django CLI
├── requirements.txt       # Python dependencies
└── .env.example           # Template de configuración
```

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Backend** | Django 4.x, Django REST Framework |
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 |
| **Database** | PostgreSQL (AWS RDS) |

## 🎮 Reglas de Migajas

| Tipo | Condición | Migajas |
|------|-----------|---------|
| 💬 Conversación | 5+ mensajes | +1 |
| 📞 Llamada | 5+ minutos | +5 |
| 📞 Llamada | < 5 minutos | +1 |
| ➖ Quitar | Manual | -N |

## 📋 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial de versiones.

## 📄 Licencia

MIT License
