import fitz  # PyMuPDF

# Define the file paths
input_pdf = "original.pdf"
output_pdf = "original_anonymized.pdf"

# Base replacements - we'll generate case variations automatically
base_replacements = {
    "CHEPLA": "GENERIC",
    "PHARM": "CORP",
    "Vesanoid": "Product-X",
    "Jurkschat": "Employee-A",
    "Zander": "Employee-B",
    "cheplapham.com": "example.com",
    "Omnitrade": "Company-Y",
    "Schloten": "Employee-C",
    "Possin": "Employee-D",
    "Dunzik": "Employee-E",
}

# Logo replacement settings
REPLACE_LOGO = True
LOGO_POSITION = "top-right"  # Where to look for the logo
LOGO_REPLACEMENT_TEXT = "GENERIC CORP"  # Text to show instead (or None for blank)
LOGO_BOX_COLOR = (1, 1, 1)  # White background (RGB 0-1 scale)

def generate_case_variations(replacements: dict) -> dict:
    """Generate common case variations for each replacement."""
    expanded = {}
    for old_text, new_text in replacements.items():
        # Original case
        expanded[old_text] = new_text
        # UPPERCASE
        expanded[old_text.upper()] = new_text.upper()
        # lowercase
        expanded[old_text.lower()] = new_text.lower()
        # Title Case
        expanded[old_text.title()] = new_text.title()
    return expanded


def find_and_replace_logo(page: fitz.Page, position: str = "top-right") -> bool:
    """
    Find images in the specified area and replace them with a blank box.
    Returns True if a logo was found and replaced.
    """
    page_rect = page.rect
    page_width = page_rect.width
    page_height = page_rect.height

    # Define search area based on position (top 15% of page, right 30%)
    if position == "top-right":
        search_area = fitz.Rect(
            page_width * 0.6,  # Left boundary (right 40% of page)
            0,  # Top
            page_width,  # Right
            page_height * 0.15,  # Bottom (top 15% of page)
        )
    elif position == "top-left":
        search_area = fitz.Rect(0, 0, page_width * 0.4, page_height * 0.15)
    else:
        return False

    # Find all images on the page
    image_list = page.get_images(full=True)
    logo_replaced = False

    for img_index, img_info in enumerate(image_list):
        xref = img_info[0]

        # Get all instances of this image on the page
        img_rects = page.get_image_rects(xref)

        for img_rect in img_rects:
            # Check if this image is in our search area
            if search_area.intersects(img_rect):
                # Cover the logo with a white rectangle
                shape = page.new_shape()
                shape.draw_rect(img_rect)
                shape.finish(color=LOGO_BOX_COLOR, fill=LOGO_BOX_COLOR)
                shape.commit()

                # Optionally add replacement text
                if LOGO_REPLACEMENT_TEXT:
                    # Calculate text position (centered in the box)
                    text_point = fitz.Point(
                        img_rect.x0 + 5,
                        img_rect.y0 + (img_rect.height / 2) + 5,
                    )
                    page.insert_text(
                        text_point,
                        LOGO_REPLACEMENT_TEXT,
                        fontname="helv",
                        fontsize=10,
                        color=(0.3, 0.3, 0.3),  # Dark gray text
                    )

                logo_replaced = True
                print(f"    Replaced logo at {img_rect}")

    return logo_replaced


def anonymize_pdf(input_path: str, output_path: str, replacements: dict) -> None:
    """Anonymize a PDF by replacing specified text while preserving layout."""
    doc = fitz.open(input_path)

    # Clear document metadata to remove author, creator, etc.
    doc.set_metadata({})

    total_replacements = 0

    for page_num, page in enumerate(doc):
        page_replacements = 0
        print(f"  Page {page_num + 1}:")

        # Replace logo if enabled (do this BEFORE text redactions)
        if REPLACE_LOGO:
            if find_and_replace_logo(page, LOGO_POSITION):
                page_replacements += 1

        for old_text, new_text in replacements.items():
            # Search for all occurrences of the text
            areas = page.search_for(old_text)

            for rect in areas:
                # Add redaction with auto-fit font size (fontsize=0)
                page.add_redact_annot(
                    rect,
                    text=new_text,
                    fontname="helv",
                    fontsize=0,  # Auto-fit to match bounding box
                    align=fitz.TEXT_ALIGN_LEFT,
                )
                page_replacements += 1

        # Apply all redactions for this page
        # images=fitz.PDF_REDACT_IMAGE_NONE preserves images
        # graphics=fitz.PDF_REDACT_IMAGE_NONE preserves vector graphics
        page.apply_redactions(
            images=fitz.PDF_REDACT_IMAGE_NONE,
            graphics=fitz.PDF_REDACT_IMAGE_NONE,
        )

        if page_replacements > 0:
            print(f"    Text replacements: {page_replacements}")
            total_replacements += page_replacements
        else:
            print(f"    No changes")

    # Save with structure preservation
    # garbage=0: preserve internal object IDs
    # deflate=True: compress for smaller file size
    doc.save(output_path, garbage=0, deflate=True)
    doc.close()

    print(f"\nTotal: {total_replacements} replacements across {len(doc)} pages")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    # Generate all case variations
    replacements = generate_case_variations(base_replacements)

    print(f"Anonymizing {input_pdf}...")
    print(f"  - Text patterns: {len(replacements)}")
    print(f"  - Logo replacement: {REPLACE_LOGO} ({LOGO_POSITION})")
    print()

    try:
        anonymize_pdf(input_pdf, output_pdf, replacements)
        print("\nSuccess!")
    except FileNotFoundError:
        print(f"Error: Could not find {input_pdf}")
    except Exception as e:
        print(f"Error: {e}")