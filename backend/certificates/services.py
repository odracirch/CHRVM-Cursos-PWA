from io import BytesIO
from django.core.files.base import ContentFile
from reportlab.pdfgen import canvas
import qrcode
from .models import Certificate

def create_certificate(student, course):
    folio=f"CHRVM-{course.id}-{student.id}-{Certificate.objects.filter(course=course).count()+1:04d}"
    cert,_=Certificate.objects.get_or_create(student=student,course=course,defaults={'folio':folio,'percentage':100,'hours':course.duration})
    if cert.pdf_file: return cert
    import os
    verify_url=f"{os.getenv('PUBLIC_WEB_URL','http://localhost:3000')}/verificar-certificado/{cert.folio}"
    qr=qrcode.make(verify_url); qbuf=BytesIO(); qr.save(qbuf,format='PNG')
    buf=BytesIO(); pdf=canvas.Canvas(buf,pagesize=(842,595)); pdf.setTitle('Certificado CHRVM Cursos')
    pdf.setFont('Helvetica-Bold',28); pdf.drawCentredString(421,490,'CHRVM CURSOS')
    pdf.setFont('Helvetica-Bold',22); pdf.drawCentredString(421,440,'CONSTANCIA DE FINALIZACIÓN')
    pdf.setFont('Helvetica',16); pdf.drawCentredString(421,380,'Se certifica que')
    pdf.setFont('Helvetica-Bold',24); pdf.drawCentredString(421,340,student.full_name)
    pdf.setFont('Helvetica',16); pdf.drawCentredString(421,295,'ha concluido satisfactoriamente el curso')
    pdf.setFont('Helvetica-Bold',20); pdf.drawCentredString(421,255,course.title)
    pdf.setFont('Helvetica',12); pdf.drawString(100,180,f'Duración: {course.duration} horas'); pdf.drawString(100,155,f'Folio: {cert.folio}'); pdf.drawString(100,130,f'Instructor: {course.instructor.full_name}')
    from reportlab.lib.utils import ImageReader
    pdf.drawImage(ImageReader(BytesIO(qbuf.getvalue())),650,90,width=100,height=100,mask='auto')
    pdf.setFont('Helvetica',10); pdf.drawCentredString(421,70,'Verificación: use el folio en la página pública de CHRVM Cursos')
    pdf.save(); buf.seek(0); cert.pdf_file.save(f'{cert.folio}.pdf',ContentFile(buf.read()),save=True); return cert
