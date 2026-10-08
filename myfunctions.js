const selectedCars = [];

function parseDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 30) return null;

  return year * 360 + (month - 1) * 30 + day;
}

function setFieldValidity($field, isValid) {
  $field.toggleClass("fail", !isValid);
  $field.attr("aria-invalid", String(!isValid));
  $field.siblings(".error-image").toggleClass("fail", !isValid);
}

$(document).ready(function () {
  $(".show-specs").on("click", function () {
    $(this).parent().parent().next().toggleClass("hide");
    $(this).toggleClass("active");
  });

  $("#btn-5").on("click", function () {
    $("#register").removeClass("hidden");
  });

  $("#closing-form").on("click", function () {
    $("#register").addClass("hidden");
  });

  $(".rent").on("click", function () {
    const $choice = $(this);
    const id = Number($choice.data("id"));
    const selectedIndex = selectedCars.findIndex((car) => car.id === id);

    if (selectedIndex === -1) {
      selectedCars.push({
        id,
        image: $choice.data("img"),
        name: String($choice.data("car")).trim(),
        dailyPrice: Number($choice.data("price")),
      });
      $choice.addClass("active").attr("aria-pressed", "true");
    } else {
      selectedCars.splice(selectedIndex, 1);
      $choice.removeClass("active").attr("aria-pressed", "false");
    }
  });

  $("#register form").on("submit", function (event) {
    event.preventDefault();
    const errors = [];
    const arabicNamePattern = /^[\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FC\u0750-\u077F\u08A0-\u08C9]+(?:\s+[\u0621-\u063A\u0641-\u064A\u066E-\u06D3\u06FA-\u06FC\u0750-\u077F\u08A0-\u08C9]+)*$/u;
    const nationalNumberPattern = /^(0[1-9]|1[0-4])\d{9}$/;
    const phonePattern = /^09\d{8}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const $name = $("#userfullname");
    const $nationalNumber = $("#nationalNumber");
    const $startDate = $("#startdate");
    const $endDate = $("#enddate");
    const $phone = $("#teleDataumber");
    const $email = $("#user-email");

    const name = $name.val().trim();
    const nationalNumber = $nationalNumber.val().trim();
    const startDate = parseDate($startDate.val().trim());
    const endDate = parseDate($endDate.val().trim());
    const phone = $phone.val().trim();
    const email = $email.val().trim();

    const nameIsValid = !name || arabicNamePattern.test(name);
    const nationalNumberIsValid = nationalNumberPattern.test(nationalNumber);
    const startDateIsValid = startDate !== null;
    let endDateIsValid = endDate !== null;

    // The end date must be later than the start date.
    if (startDateIsValid && endDateIsValid) {
      endDateIsValid = endDate > startDate;
    }
    const phoneIsValid = !phone || phonePattern.test(phone);
    const emailIsValid = !email || emailPattern.test(email);

    setFieldValidity($name, nameIsValid);
    setFieldValidity($nationalNumber, nationalNumberIsValid);
    setFieldValidity($startDate, startDateIsValid);
    setFieldValidity($endDate, endDateIsValid);
    setFieldValidity($phone, phoneIsValid);
    setFieldValidity($email, emailIsValid);

    if (!nameIsValid) errors.push("الاسم يجب أن يحتوي على أحرف عربية فقط.");
    if (!nationalNumberIsValid) errors.push("الرقم الوطني يجب أن يتكون من 11 خانة ويبدأ برقم من 01 إلى 14.");
    if (!startDateIsValid) errors.push("أدخل تاريخ بداية صحيحاً بصيغة يوم/شهر/سنة.");
    if (!endDate) errors.push("أدخل تاريخ نهاية صحيحاً بصيغة يوم/شهر/سنة.");
    else if (!endDateIsValid) errors.push("تاريخ نهاية التأجير يجب أن يكون بعد تاريخ البداية.");
    if (!phoneIsValid) errors.push("رقم الموبايل يجب أن يتكون من 10 أرقام ويبدأ بـ 09.");
    if (!emailIsValid) errors.push("أدخل بريداً إلكترونياً صحيحاً.");
    if (selectedCars.length === 0) errors.push("اختر سيارة واحدة على الأقل.");

    const $formErrors = $("#form-errors");
    const $errorList = $formErrors.find("ul").empty();

    if (errors.length > 0) {
      errors.forEach((message) => {
        $errorList.append($("<li>").text(message));
      });
      $formErrors.prop("hidden", false);
      return;
    }

    $formErrors.prop("hidden", true);
    const rentalDays = endDate - startDate;
    const subtotal = selectedCars.reduce(
      (total, car) => total + car.dailyPrice * rentalDays,
      0
    );
    // Apply the discount only when the rental exceeds seven days.
    const discount = rentalDays > 7 ? subtotal * 0.1 : 0;
    const $invoiceRows = $("#carting-table").empty();

    // Add one invoice row for each selected car.
    selectedCars.forEach((car) => {
      const $image = $("<img>").attr({ src: car.image, alt: car.name });
      const $row = $("<tr>");
      $row.append($("<td>").append($image));
      $row.append($("<td>").text(car.name));
      $row.append($("<td>").text(car.dailyPrice));
      $row.append($("<td>").text(rentalDays));
      $row.append($("<td>").text(car.dailyPrice * rentalDays));
      $invoiceRows.append($row);
    });

    $("#rental-days").text(rentalDays);
    $("#subtotal").text(subtotal);
    $("#discount-label").text(rentalDays > 7 ? "الحسم (10%)" : "الحسم");
    $("#discount-amount").text(discount);
    $("#finalTotal").text(subtotal - discount);
    $(".over-layer").addClass("show");
  });

  $("#good").on("click", function () {
    $(".over-layer").removeClass("show");
  });
});
