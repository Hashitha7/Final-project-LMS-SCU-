from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

c = canvas.Canvas('test_student_answer.pdf', pagesize=letter)
c.setFont("Helvetica", 14)

lines = [
    "Student Name: Kasun Perera",
    "Grade: 11",
    "Subject: Biology",
    "Topic: Photosynthesis",
    "",
    "Answer:",
    "Photosynthesis is the process by which green plants and some other",
    "organisms use sunlight to synthesize nutrients from carbon dioxide",
    "and water. Photosynthesis in plants generally involves the green pigment",
    "chlorophyll and generates oxygen as a by-product.",
    "",
    "The process takes place primarily in the leaves, specifically in the",
    "chloroplasts. It requires light energy, water absorbed from the roots,",
    "and carbon dioxide from the air. The chemical equation for photosynthesis",
    "is 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2.",
    "",
    "This process is essential for life on earth as it provides oxygen",
    "for all living organisms to breathe and is the primary source of energy",
    "for the entire food web."
]

y = 750
for line in lines:
    c.drawString(50, y, line)
    y -= 25

c.save()
print("Success! Created test_student_answer.pdf")
