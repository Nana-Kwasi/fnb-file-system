


from pptx import Presentation
from pptx.util import Inches, Pt
 
# Create a new presentation
prs = Presentation()
 
# Define slide layout
title_slide_layout = prs.slide_layouts[0]
content_slide_layout = prs.slide_layouts[1]
 
# Title Slide
slide = prs.slides.add_slide(title_slide_layout)
slide.shapes.title.text = "Tier 3 Pensions Withdrawal Practices in Banks in Ghana"
slide.placeholders[1].text = "Prepared by: [Your Name]\nDate: [Presentation Date]"
 
# Slide data: title, content, notes
slides_data = [
    ("Introduction",
     "• Overview of the pension system in Ghana\n• 3-tier structure:\n  - Tier 1: SSNIT (mandatory)\n  - Tier 2: Mandatory occupational pension\n  - Tier 3: Voluntary savings and provident funds",
     "Introduce the audience to the structure of the pension system in Ghana, focusing on how the three tiers operate together."),
 
    ("Focus on Tier 3",
     "• Voluntary long-term savings\n• Includes provident funds\n• Regulated by the National Pensions Regulatory Authority (NPRA)",
     "Explain what Tier 3 pensions are, emphasizing their voluntary nature and regulatory framework."),
 
    ("Importance of Tier 3",
     "• Offers tax benefits\n• Flexible contributions\n• Supplementary income for retirement",
     "Discuss why Tier 3 is a valuable addition to the pension system and how it benefits contributors."),
 
    ("Withdrawal Rules (NPRA Guidelines)",
     "• Can withdraw:\n  - After 10 years (tax-free)\n  - On emigration\n  - On medical grounds\n• Early withdrawal attracts tax\n• Requires supporting documents",
     "Provide an overview of the conditions under which Tier 3 funds can be withdrawn and associated tax implications."),
 
    ("Role of Banks in Tier 3 Pensions",
     "• Act as custodians or fund managers\n• Facilitate contributions and withdrawals\n• Provide compliance and advisory services",
     "Describe the involvement of banks in managing Tier 3 pensions and helping customers access their funds."),
 
    ("Common Practices by Banks in Ghana",
     "• Standard withdrawal procedures\n• Customer education initiatives\n• Use of digital platforms\n• Challenges: documentation, awareness",
     "Highlight the current practices observed in banks, both good practices and common challenges."),
 
    ("Issues and Gaps",
     "• Low public awareness\n• Delays in processing\n• Inconsistent practices\n• Weak regulatory enforcement",
     "Identify some of the challenges affecting effective Tier 3 withdrawals across the banking sector."),
 
    ("Recommendations",
     "• Enhanced public education\n• Streamlined processes\n• Improved digital services\n• Staff training",
     "Offer practical suggestions for improving Tier 3 pension withdrawal practices in Ghana."),
 
    ("Conclusion",
     "• Tier 3 is key for retirement planning\n• Withdrawal must be smooth and efficient\n• Banks play a vital role",
     "Summarize the presentation and reinforce the need for improved withdrawal processes."),
 
    ("Q&A",
     "Any questions or comments?",
     "Encourage audience participation and address their concerns."),
 
    ("References",
     "• NPRA Guidelines\n• Bank publications and websites\n• Industry reports and articles",
     "List your information sources to add credibility to your presentation.")
]
 
# Function to add content slides
def add_content_slide(title, content, notes):
    slide = prs.slides.add_slide(content_slide_layout)
    slide.shapes.title.text = title
    slide.placeholders[1].text = content
    if notes:
        slide.notes_slide.notes_text_frame.text = notes
 
# Add all slides
for title, content, notes in slides_data:
    add_content_slide(title, content, notes)
 
# Save the file
prs.save("Tier_3_Pensions_Withdrawal_Ghana.pptx")
print("Presentation saved as 'Tier_3_Pensions_Withdrawal_Ghana.pptx'")






//error
PS C:\Users\f8877557\OneDrive - FRG\Desktop\chatboat> python main.py
  File "C:\Users\f8877557\OneDrive - FRG\Desktop\chatboat\main.py", line 5
    from pptx.util import Inches,
                                 ^
SyntaxError: trailing comma not allowed without surrounding parentheses
PS C:\Users\f8877557\OneDrive - FRG\Desktop\chatboat> 