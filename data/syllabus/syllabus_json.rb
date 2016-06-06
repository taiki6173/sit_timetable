require 'open-uri'
require 'nokogiri'

#表をパース
def makeSyllabusList(fileURL)
	doc = Nokogiri::HTML(open(fileURL))
	rString = '{"syllabus":['
	#科目名を含む行
	firstTr = 1
	doc.css('tr[bgcolor="#FFFFEE"]').each do |tr|
		subject = tr.css('td:nth-child(2)')
		credit = tr.css('td:nth-child(3)')
		if firstTr == 1
			firstTr = 0
		else
			rString += ','
		end
		rString += '{"subject":"' + subject.text.tr('０-９ａ-ｚＡ-Ｚ＆　', '0-9a-zA-Z& ') + '","credit":' + credit.text + ','
		linkExist = 0
		subject.css('a').each do |link|
			rString += '"url":"' + URI.join(fileURL, link['href']).to_s + '"}'
			linkExist = 1
		end
		if linkExist == 0
			rString += '"url":""}'
		end
	end
	rString += ']}'
	return rString
end

#学科リストからファイルを生成
def files

end
print makeSyllabusList('http://syllabus.sic.shibaura-it.ac.jp/syllabus/2016/MatrixL01165.html')