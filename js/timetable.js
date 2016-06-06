//時間割情報:グローバル変数
var info = {
    faculty: {
        name: null,
        value: null
    },
    department: {
        name: null,
        value: null
    },
    grade: [],
    semester: null,
    teacher: null
};

$(function () {
    setting.init();
    //時間割が登録されていたらそれを表示
    if (localStorage.getItem("timetable") && localStorage.getItem("info")) {
        setInfo();
        setTable();
        preset.info();
        $('#retry').css("display", "block");
        $('#remove').css("display", "block");
        $('#retry').click(function () {
            setting.show();
            $('#cover').click(function () {
                //画面操作を有効化する
                screenBlur.unLock();
                $('#setting').fadeOut(500);
            });
        })
        $('#remove').click(function () {
            localStorage.removeItem("timetable");
            localStorage.removeItem("info");
            location.reload();
        })
        dispCanceled();
    } else {
        $('#commandButtons').css("display", "block");
        setting.show();
    }

    $('a#edit').click(function () {
        setting.show();
        $('#cover').click(function () {
            //画面操作を有効化する
            screenBlur.unLock();
            $('#setting').fadeOut(500);
        });
    });


    $('a#clear').click(function () {
        if (window.confirm('これまでの設定内容をクリアします。よろしいですか？')) {
            var $targetCells = $('table.timetable > tbody td');
            $targetCells.find('select').val("");
            $targetCells.attr('rowSpan', 1);
            $targetCells.css("display", "table-cell");
        }
    });


    $('a#done').click(function () {
        localStorage.setItem("timetable", JSON.stringify(getTable()));
        localStorage.setItem("info", JSON.stringify(info));
        alert("保存が完了しました");
        location.reload();
    });

    $('a#export').click(function () {
        exportTable();
    });
    $('a#import').click(function () {
        importTable();
        location.reload();
    });
});

//設定された情報をinfoに格納.引数loadがtrueならプルダウン時間割を表示
function applyInfo(load) {
    info.faculty.value = parseInt($('[name="faculty"]:checked').val());
    info.faculty.name = $('[name="faculty"]:checked').parent().text();
    info.department.value = parseInt($('[name="department"]').val());
    info.department.name = $('[name="department"] option:selected').text();
    info.grade = $('[name="grade"]:checked').map(function () {
        return $(this).val()
    });
    info.semester = $('[name="semester"]:checked').val();
    info.teacher = $('[name="teacher"]:checked').val() == "true" ? true : false;
    if (load) {
        loadTable();
    }
}

//プルダウン時間割を表示
function loadTable() {
    var generalFileURL = 'data/timetable/' + info.faculty.value + '/' + info.department.value + '.json';
    varteacherFileURL = 'data/timetable/' + info.faculty.value + '/';
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var grade;
    var sem;
    var tmpArr, thisItem, isDup, definedTable;
    var $select;
    rowAndColumn.show();
    grade = info.grade;
    sem = info.semester;
    //教職科目以外のプルダウンメニューを表示
    $.getJSON(generalFileURL, function (data) {
            //1~7限
            for (var i = 0; i < 7; i++) {
                //曜日
                for (var j = 0; j < 6; j++) {
                    $list = $('<select name="' + i + j + '"></select>');
                    //学年
                    for (var g = 0; g < grade.length; g++) {
                        tmpArr = [];
                        $gradeList = $('<optgroup label="' + grade[g] + '年"></optgroup>');
                        for (var k = 0; k < data.timetable[grade[g] + sem][days[j]].length; k++) {
                            thisItem = data.timetable[grade[g] + sem][days[j]][k][i];
                            if (data.timetable[grade[g] + sem][days[j]][k][i].subject != '') {
                                //重複チェック
                                isDup = false;
                                for (var l = 0; l < tmpArr.length; l++) {
                                    if (tmpArr[l] == thisItem.subject) {
                                        isDup = true;
                                    }
                                }
                                if (!isDup) {
                                    tmpArr.unshift(thisItem.subject);
                                    $gradeList.append('<option value="' + thisItem.class + '">' + thisItem.subject + '</option>');
                                }
                            }
                        }
                        if ($gradeList.find('option').length > 0) {
                            $list.prepend($gradeList);
                        }
                    }
                    $list.prepend('<option value=""></option>');
                    if ($list.find('option').length > 1) {
                        $('table.timetable tbody > tr:eq(' + i + ') > td:eq(' + j + ')').append($list);
                    }
                }
            }
        })
        .done(function () {
            //教職科目のプルダウンメニューを表示
            if (info.teacher) {
                //4年生を消去（教職科目には4年がないため）
                grade = $.map(grade, function (n) {
                    if (n != "4") {
                        return n;
                    } else {
                        return null;
                    }
                });
                $.getJSON(teacherFileURL + getTeacherFileName(), function (data) {
                        //1~7限
                        for (var i = 0; i < 7; i++) {
                            //曜日
                            for (var j = 0; j < 6; j++) {
                                $list = $('<select name="' + i + j + '"></select>');
                                //学年
                                for (var g = 0; g < grade.length; g++) {
                                    tmpArr = [];
                                    $gradeList = $('<optgroup label="教職科目' + grade[g] + '年"></optgroup>');
                                    for (var k = 0; k < data.timetable[grade[g] + sem][days[j]].length; k++) {
                                        thisItem = data.timetable[grade[g] + sem][days[j]][k][i];
                                        if (data.timetable[grade[g] + sem][days[j]][k][i].subject != '') {
                                            //重複チェック
                                            isDup = false
                                            for (var l = 0; l < tmpArr.length; l++) {
                                                if (tmpArr[l] == thisItem.subject) {
                                                    isDup = true;
                                                }
                                            }
                                            if (!isDup) {
                                                tmpArr.unshift(thisItem.subject);
                                                $gradeList.append('<option value="' + thisItem.class + '">' + thisItem.subject + '</option>');
                                            }
                                        }
                                    }
                                    if ($gradeList.find('option').length > 0) {
                                        $list.prepend($gradeList);
                                    }
                                }
                                if ($list.find('option').length > 0) {
                                    $select = $('table.timetable tbody > tr:eq(' + i + ') > td:eq(' + j + ')');
                                    if ($select.find('select').length > 0) {
                                        $select.find('select option').eq(0).after($list.find('optgroup'));
                                    } else {
                                        $list.prepend('<option value=""></option>');
                                        $select.append($list);
                                    }
                                }
                            }
                        }
                    })
                    .done(function () {
                        finalProcessing();
                    })
            } else {
                finalProcessing();
            }
        });
}

function finalProcessing() {
    //空白を選択(for Firefox)
    for (var i = 0; i < $('table.timetable select').length; i++) {
        $('table.timetable select').eq(i).val("");
    }
    if (preset.isSameInfo()) {
        preset.table();
    }
    //コマ数変更に対応
    rowReset();
    rowSet();
    $('table.timetable select').change(function () {
        rowReset();
        rowSet();
    });
}

//localstorageからプリセット
var preset = {
    table: function () {
        if (localStorage.getItem("timetable")) {
            var table = JSON.parse(localStorage.getItem("timetable"));
            var $targetOptions, $thisOption;
            //1~7限
            for (var i = 0; i < 7; i++) {
                //曜日
                for (var j = 0; j < 6; j++) {
                    if (table[i][j].subject != "") {
                        $targetOptions = $('table.timetable > tbody > tr:eq(' + i + ') > td:eq(' + j + ') option');
                        for (k = 1; k < $targetOptions.length; k++) {
                            $thisOption = $targetOptions.eq(k);
                            if (table[i][j].subject == $thisOption.text()) {
                                $thisOption.prop("selected", true);
                            }
                        }
                    }
                }
            }
        }
    },
    info: function () {
        $('[name="faculty"]').eq(info.faculty.value).prop("checked", true);
        //loadDepMenu内で学科プリセット
        loadDepMenu();
        for (var i = 0; i < info.grade.length; i++) {
            $('[name="grade"]').eq(parseInt(info.grade[i]) - 1).prop("checked", true);
        }
        if (info.semester == "A") {
            $('[name="semester"]').eq(0).prop("checked", true);
        } else {
            $('[name="semester"]').eq(1).prop("checked", true);
        }
        if (info.teacher) {
            $('[name="semester"]').eq(1).prop("checked", true);
        } else {
            $('[name="semester"]').eq(0).prop("checked", true);
        }
    },
    isSameInfo: function () {
        if (!localStorage.getItem("info")) {
            return false;
        }
        storageInfo = JSON.parse(localStorage.getItem("info"));
        var fac = info.faculty.value == storageInfo.faculty.value,
            dep = info.department.value == storageInfo.department.value,
            gra = info.grade.toString() == storageInfo.grade.toString(),
            tea = info.teacher == storageInfo.teacher;
        return fac && dep && gra && tea;
    }
}

//時間割のrowspanをすべて1に
function rowReset() {
    var $targetCells = $('table.timetable > tbody td');
    $targetCells.css("display", "table-cell");
    $targetCells.removeClass('canceled');
    $targetCells.attr('rowSpan', 1);
}


//時間割のrowspanを設定
function rowSet() {
    var $targetCell, numClass;
    //曜日
    for (var j = 0; j < 6; j++) {
        //1~7限
        for (var i = 0; i < 7;) {
            $targetCell = $('table.timetable > tbody > tr:eq(' + i + ') > td:eq(' + j + ')');
            numClass = parseInt($targetCell.children('select').val());
            //numclassがundefined OR "" なら1
            if (!numClass) {
                numClass = 1;
            }
            $targetCell.attr('rowSpan', numClass);
            for (var k = i + 1; k < i + numClass; k++) {
                $('table.timetable > tbody > tr:eq(' + k + ') > td:eq(' + j + ')').css("display", "none");
            }
            i += numClass;
        }
    }
}

//時間割のtd内の要素をすべて削除
function emptyTable() {
    $('table.timetable td').empty();
    $('#sumOfCredits').empty();
}


//設定された時間割を取得
function getTable() {
    var $targetCell, subject, numClass, sylData;
    //Rows:Period, Columns:Day
    var table = [
        [, , , , , ],
        [, , , , , ],
        [, , , , , ],
        [, , , , , ],
        [, , , , , ],
        [, , , , , ],
        [, , , , , ]
    ];
    //曜日
    for (var j = 0; j < 6; j++) {
        //1~7限
        for (var i = 0; i < 7; i++) {
            $targetCell = $('table.timetable > tbody > tr:eq(' + i + ') > td:eq(' + j + ')');
            subject = $targetCell.find('select option:selected').text();
            numClass = parseInt($targetCell.children('select').val());
            sylData = getSyllabus(subject);
            table[i][j] = {
                "subject": subject,
                "class": numClass,
                "url": sylData['url'],
                "credit": sylData['credit'],
            };
            //numclassがundefined OR "" なら1
            if (!numClass) {
                numClass = 1;
            }
            for (var k = i + 1; k < i + numClass; k++) {
                $('table.timetable > tbody > tr:eq(' + k + ') > td:eq(' + j + ')').val("");
            }
        }
    }
    return table;
}

//シラバスから、subjectName(科目名)に一致するURLと単位数を取得
function getSyllabus(subjectName) {
    var rData = {
        'url': "",
        'credit': ""
    }
    if (subjectName.indexOf("＊") >= 0) {
        subjectName = subjectName.substr(0, subjectName.length - 1);
    }
    $.ajax({
            type: "GET",
            url: 'data/syllabus/' + info.faculty.value + '/' + info.department.value + '.json',
            async: false,
            dataType: "json",
            success: function (data) {
                for (var i = 0; i < data['syllabus'].length; i++) {
                    if (subjectName == data['syllabus'][i]['subject']) {
                        rData['url'] = data['syllabus'][i]['url'];
                        rData['credit'] = data['syllabus'][i]['credit'];
                    }
                }
            }
        })
        .done(function () {
            //教職科目
            if (info.teacher) {
                $.ajax({
                    type: "GET",
                    url: 'data/syllabus/' + info.faculty.value + '/' + getTeacherFileName(),
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        for (var i = 0; i < data['syllabus'].length; i++) {
                            if (subjectName == data['syllabus'][i]['subject']) {
                                rData['url'] = data['syllabus'][i]['url'];
                                rData['credit'] = data['syllabus'][i]['credit'];
                            }
                        }
                    }
                });
            }
        });
    return rData;
}

function getTeacherFileName() {
    switch (info.faculty.value) {
    case 0:
        return "12.json";
        break;
    case 1:
        return "1.json";
        break;
    case 2:
        return "4.json";
        break;
    default:
        return "12.json";
        break;
    }
}

//localStorageに保存されたデータを時間割表に反映
function setTable() {
    var table = JSON.parse(localStorage.getItem("timetable"));
    var $targetCell, numClass;
    //単位数の合計
    var sum = 0;
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 6; j++) {
            $targetCell = $('table.timetable > tbody > tr:eq(' + i + ') > td:eq(' + j + ')');
            if (table[i][j]['subject']) {
                if (table[i][j]['url'] != '') {
                    $targetCell.html('<h3><a href="' + table[i][j]['url'] + '" target="_blank">' + table[i][j]['subject'] + '</a></h3>');
                } else {
                    $targetCell.html('<h3><a>' + table[i][j]['subject'] + '</a></h3>');
                }
                $targetCell.append('<span>単位数:' + String(table[i][j]['credit']) + '</span>');
                sum += table[i][j]['credit'];
                console.log(sum);
            }
        }
    }
    //rowspan設定
    //曜日
    for (var j = 0; j < 6; j++) {
        //1~7限
        for (var i = 0; i < 7;) {
            $targetCell = $('table.timetable > tbody > tr:eq(' + i + ') > td:eq(' + j + ')');
            numClass = parseInt(table[i][j]['class']);
            //numclassがundefined OR "" なら1
            if (!numClass) {
                numClass = 1;
            }
            $targetCell.attr('rowSpan', numClass);
            for (var k = i + 1; k < i + numClass; k++) {
                $('table.timetable > tbody > tr:eq(' + k + ') > td:eq(' + j + ')').css("display", "none");
            }
            i += numClass;
        }
    }
    //空の行と列を非表示
    rowAndColumn.hide();

    $('#sumOfCredits').text("単位数:" + String(sum));
}


//空の行と列を非表示
var rowAndColumn = {
    hide: function () {
        var isEmpty;
        var $tr = $('table.timetable tbody tr');
        var $td = $('table.timetable tbody td');
        //行(7限から)
        for (var i = 6; i > 0; i--) {
            if ($tr.eq(i).find('td').children().length == 0) {
                isEmpty = true;
                for (var j = 0; j < 6; j++) {
                    if ($tr.eq(i).find('td').eq(j).css("display") == "none") {
                        isEmpty = false;
                    }
                }
                if (isEmpty) {
                    $tr.eq(i).css("display", "none");
                }
            } else {
                break;
            }
        }
        //列(土曜から)
        for (var i = 5; i > 0; i--) {
            isEmpty = true;
            for (var j = 0; j < 7; j++) {
                if ($td.eq(i + j * 6).children().length > 0) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                for (var j = 0; j < 8; j++) {
                    $('table.timetable tr').eq(j).children().eq(i + 1).css("display", "none");
                }
            } else {
                break;
            }
        }
    },
    show: function () {
        $('table.timetable tr').css("display", "table-row");
        $('table.timetable tr > *').css("display", "table-cell");
    }
}

//localStorageに保存されたデータを取得し、表示
function setInfo() {
    info = JSON.parse(localStorage.getItem("info"));
    dispTitle();
}

function exportTable() {
    $.base64.utf8encode = true;
    $.base64.utf8decode = true;
    var table = $.base64.atob(localStorage.getItem("timetable"));
    console.log(table)
    $("textarea#portArea").val(table);
}

function importTable() {
    $.base64.utf8encode = true;
    var table = $.base64.btoa($("textarea#portArea").val());
    localStorage.setItem("timetable", table);
}

//グローバル変数
var page = 0;
var $items = null;
var setting = {
    //設定画面の初期化
    init: function () {
        $items = $('#setting').children();
        //学科読み込み
        $('[name="faculty"]').change(function () {
            info.faculty.value = parseInt($('[name="faculty"]:checked').val());
            loadDepMenu();
        });
        //次へ
        $('#next').click(function () {
            $items.eq(page).css("display", "none");
            $items.eq(++page).fadeIn();
            $('#prev').css("display", "inline-block");
            $('#page').css("display", "inline-block");
            $('#page').text('[' + page + '/' + ($items.length - 3) + ']');
            if (page == $items.length - 2) {
                dispConfirm();
                $('#next').css("display", "none");
                $('#settingDone').css("display", "inline-block");
                $('#page').text('');
            }
            //学科メニュー読み込み
            if (page == 1 && !localStorage.getItem("info")) {
                info.faculty.value = parseInt($('[name="faculty"]:checked').val());
                loadDepMenu();
            }
            //チェックされていなければ、クリックできないボタンを表示
            if (page == 3) {
                if (isChecked($items.eq(page))) {
                    $('#next').css("display", "inline-block");
                    $('#nextDummy').css("display", "none");
                } else {
                    $('#next').css("display", "none");
                    $('#nextDummy').css("display", "inline-block");
                }
                $('input').click(function () {
                    if (isChecked($items.eq(page))) {
                        $('#next').css("display", "inline-block");
                        $('#nextDummy').css("display", "none");
                    } else {
                        $('#next').css("display", "none");
                        $('#nextDummy').css("display", "inline-block");
                    }
                });
            }
        });
        //前へ
        $('#prev').click(function () {
            $items.eq(page).css("display", "none");
            $items.eq(--page).fadeIn();
            $('#next').css("display", "inline-block");
            $('#nextDummy').css("display", "none");
            $('#settingDone').css("display", "none");
            $('#page').css("display", "inline-block");
            $('#page').text('[' + page + '/' + ($items.length - 3) + ']');
            if (page == 0) {
                $('#prev').css("display", "none");
                $('#page').css("display", "none");
            }
        });
        //完了
        $('#settingDone').click(function () {
            applyInfo(true);
            dispTitle();
            emptyTable();
            //画面操作を有効化する
            screenBlur.unLock();
            $('#setting').fadeOut(500);
            $('#commandButtons').css("display", "block");
            $('#retry').css("display", "none");
            copyConfirmTable();
            window.location.href = '#main';
        });
    },
    show: function () {
        var $welcomeMsg = $items.first();
        var $buttons = $items.last();
        page = 0;
        $items.css("display", "none");
        $welcomeMsg.css("display", "block");
        $buttons.css("display", "block");
        $buttons.children().css("display", "none");
        $('#next').css("display", "inline-block");

        //画面操作を無効化し、設定画面を表示
        screenBlur.lock();
        $('#setting').fadeIn(800);
    }
}



//画面操作の有効化と無効化
var screenBlur = {
    coverId: 'cover',
    //画面操作を有効化
    lock: function () {
        $('#content').addClass("blur");
        var coverDiv = $('<div></div>').attr("id", this.coverId);
        coverDiv.css({
            zIndex: 1,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        });
        $('body').append(coverDiv);
    },
    //画面操作を無効化
    unLock: function () {
        $('#content').removeClass("blur");
        $("#" + this.coverId).remove();
    }
}

//学科メニューのロード
function loadDepMenu() {
    $.ajax({
        type: "GET",
        url: 'data/timetable/list.json',
        dataType: "json",
        success: function (data) {
            var depList = data.faculty[info.faculty.value].department;
            $('select[name="department"]').empty();
            for (var i = 0; i < depList.length; i++) {
                if (depList[i].isDep) {
                    $('select[name="department"]').append('<option value="' + String(i) + '">' + depList[i].name + '</option>');
                }
            }
        }
    }).done(function () {
        //学科プリセット
        if (preset.isSameInfo()) {
            $('[name="department"] option').eq(info.department.value).prop("selected", true);
        }
    });
}

//現在の設定項目のinputにチェックされているものがあるか
function isChecked($item) {
    var checked = false;
    for (var j = 0; j < $item.find('input').length; j++) {
        if ($item.find('input').eq(j).prop('checked')) {
            checked = true;
            break;
        }
    }
    return checked;
}

//確認画面の表示
function dispConfirm() {
    applyInfo(false);
    var $td = $('#confirmMsg table td');
    var sem = info.semester == "A" ? "前期" : "後期";
    var teacher = info.teacher ? "履修している" : "履修していない";
    $td.eq(0).text(info.faculty.name);
    $td.eq(1).text(info.department.name);
    $td.eq(2).text(function () {
        var str = "";
        for (var i = 0; i < info.grade.length; i++) {
            if (i > 0) {
                str += ", ";
            }
            str += info.grade[i] + "年";
        }
        return str;
    });
    $td.eq(3).text(sem);
    $td.eq(4).text(teacher);
}

//確認表の一部をタイトル下に表示
function copyConfirmTable() {
    var $table = $('<table><tbody></tbody></table>');
    var $tr = $('#confirmMsg table tr').clone();
    $table.append($tr.eq(2));
    $table.append($tr.eq(4));
    $('#titleInfo').html($table);
    $('#titleInfo').css("display", "block");
}

//タイトルの表示
function dispTitle() {
    var sem = info.semester == "A" ? "前期" : "後期";
    $('h2').text(info.faculty.name + ' ' + info.department.name + ' ' + sem);
}

//休講情報
function dispCanceled() {
    //1週間の休講ページ(from http://msgsot.sic.shibaura-it.ac.jp/cancel.html)
    //[0]:工学部,[1]:システム理工学部,[2]:デザイン工学部
    var list = [
        ["http://msgsot.sic.shibaura-it.ac.jp/cancel/t01/week.html", "http://msgsot.sic.shibaura-it.ac.jp/cancel/t02/week.html", "http://msgsot.sic.shibaura-it.ac.jp/cancel/o01/week.html", "http://msgsot.sic.shibaura-it.ac.jp/cancel/o02/week.html"],
        ["http://msgsot.sic.shibaura-it.ac.jp/cancel/o03/week.html"],
        ["http://msgsot.sic.shibaura-it.ac.jp/cancel/o06/week.html", "http://msgsot.sic.shibaura-it.ac.jp/cancel/s06/week.html"]
    ];
    var links;
    var meDir = cd(location.href);
    var regExp = new RegExp(meDir);
    var cnt = 0;
    //休講情報リストJSONファイル取得
    links = [];
    var canceledDays = function () {
        var def = new $.Deferred;
        for (var i = 0; i < list[info.faculty.value].length; i++) {
            (function (i) {
                $.ajax({
                    url: list[info.faculty.value][i],
                    type: "GET",
                    dataType: "html",
                    success: function (res) {
                        $tmp = $(res.responseText);
                        //リンクを格納
                        for (var j = 0; j < $tmp.length; j++) {
                            if ($tmp[j].nodeName == "A") {
                                $tmp[j].href = $tmp[j].href.replace(regExp, cd(list[info.faculty.value][i]));
                                links.push($tmp[j]);
                            }
                        }
                        cnt++;
                    }
                }).done(function () {
                    if (cnt >= list[info.faculty.value].length) {
                        def.resolve();
                    }
                })
            })(i);
        }
        return def.promise();
    };
    canceledDays().done(function () {
        var date, day, subject;
        for (var j = 0; j < links.length; j++) {
            (function (j) {
                //それぞれの日付について、休講する科目名を取得
                $.ajax({
                    url: links[j].href,
                    type: "GET",
                    dataType: "html",
                    success: function (res) {
                        //曜日番号を取得
                        date = links[j].text.split("/");
                        day = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2])).getDay();
                        //該当する曜日の教科名を探索し、存在したらclassを"canceled"に
                        for (var k = 0; k < 7; k++) {
                            var subject = $('table.timetable tbody tr:eq(' + k + ') td:eq(' + (day - 1) + ') h3').text();
                            var $targetCell = $('table.timetable tbody tr:eq(' + k + ') td:eq(' + (day - 1) + ')');
                            if (subject != "" && toHalfWidth(res.responseText).indexOf(subject) >= 0) {
                                if (!$targetCell.hasClass('canceled')) {
                                    $targetCell.addClass('canceled');
                                    $targetCell.find('h3').after('<p><a target="_blank" href="' + links[j].href + '">休講の可能性</a></p>');
                                }
                            }
                        }
                    }
                });
            })(j);
        }
    })
}

//半角に変換する
function toHalfWidth(str) {
    var half = str.replace(/[！-～]/g,
        function (tmpStr) {
            //文字コードをシフト
            return String.fromCharCode(tmpStr.charCodeAt(0) - 0xFEE0);
        }
    );
    return half.replace(/　/g, " ");
}

//現在のディレクトリを取得
function cd(urlStr) {
    var path = urlStr.split("/");
    var regExp = new RegExp(path[path.length - 1]);
    return urlStr.replace(regExp, '');
}
