# Generates sequence of notes
# Dan Nielsen
import math
s = math.sqrt(5)
phi = (1. + s) * .5
psi = 1. - phi
c = 1. / s
j = 0
scale = 1
for i in range(-48,48):
  fib = (scale * round((math.pow(phi,i) - math.pow(psi,i)) * c)) #/ math.pow(phi,abs(i))
  res = ((11 * int(fib)) % 36)
  # print i, fib, res
  print "['"+str(int(math.floor(j/16)))+":0:"+str(j%16)+"', [ff("+str(res)+")]],"
  j+=1
